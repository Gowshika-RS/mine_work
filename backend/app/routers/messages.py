import os
import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from ..database import get_db
from ..models import Message, User
from ..schemas import MessageCreate, MessageOut
from ..auth.security import require_admin, require_worker, require_any_role, require_supervisor_or_admin
from ..websocket import manager
from ..utils.audit_logging import log_audit

router = APIRouter(prefix="/messages", tags=["Communication Module"])


def enrich_message(msg: Message, db: Session) -> Message:
    if msg.sender_id:
        sender = db.query(User).filter(User.id == msg.sender_id).first()
        if sender:
            s_name = sender.profile.full_name if sender.profile else sender.username
            s_role = sender.role.capitalize() if sender.role else "Worker"
            msg.sender_name = f"{s_name} ({s_role})"
            msg.sender_role = sender.role
        else:
            msg.sender_name = "Unknown (Worker)"
            msg.sender_role = "worker"
    else:
        msg.sender_name = "System (Admin)"
        msg.sender_role = "admin"

    if msg.receiver_id:
        receiver = db.query(User).filter(User.id == msg.receiver_id).first()
        if receiver:
            r_name = receiver.profile.full_name if receiver.profile else receiver.username
            r_role = receiver.role.capitalize() if receiver.role else "Worker"
            msg.receiver_name = f"{r_name} ({r_role})"
            msg.receiver_role = receiver.role
        else:
            msg.receiver_name = "Unknown (Worker)"
            msg.receiver_role = "worker"
    else:
        msg.receiver_name = "Group Target"
        msg.receiver_role = msg.group_target or "all"

    return msg


@router.post("/send", response_model=MessageOut)
async def send_message(
    payload: MessageCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    """Send a direct or group message with support for media, reply, and real-time sockets"""
    if payload.message_type == "direct" and not payload.receiver_id:
        raise HTTPException(
            status_code=400,
            detail="receiver_id is required for direct messages"
        )

    if payload.message_type in ("announcement", "emergency") and user.role not in ("admin", "supervisor"):
        raise HTTPException(
            status_code=403,
            detail="Only supervisors and admins can send announcements and emergency messages"
        )

    msg = Message(
        sender_id=user.id,
        receiver_id=payload.receiver_id,
        group_target=payload.group_target,
        message_type=payload.message_type,
        content=payload.content,
        media_url=payload.media_url,
        media_type=payload.media_type or "text",
        reply_to_id=payload.reply_to_id,
        delivered_status="delivered",
        is_read=False
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    sender_raw_name = user.profile.full_name if user.profile else user.username
    sender_role_label = user.role.capitalize() if user.role else "Worker"
    sender_formatted_name = f"{sender_raw_name} ({sender_role_label})"

    # WebSocket Real-Time Payload
    ws_payload = {
        "type": "new_message",
        "id": msg.id,
        "sender_id": user.id,
        "sender_name": sender_formatted_name,
        "sender_role": user.role or "worker",
        "receiver_id": payload.receiver_id,
        "message_type": payload.message_type,
        "content": payload.content,
        "media_url": payload.media_url,
        "media_type": payload.media_type or "text",
        "reply_to_id": payload.reply_to_id,
        "timestamp": msg.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "delivered_status": "delivered"
    }

    if payload.message_type == "direct" and payload.receiver_id:
        await manager.send_personal_message(ws_payload, payload.receiver_id)
        # Notify sender for confirmation
        await manager.send_personal_message(ws_payload, user.id)
    elif payload.group_target == "workers":
        await manager.broadcast_to_role(ws_payload, "worker")
    elif payload.group_target == "supervisors":
        await manager.broadcast_to_role(ws_payload, "supervisor")
    elif payload.group_target == "admins":
        await manager.broadcast_to_role(ws_payload, "admin")
    elif payload.group_target == "all" or payload.message_type in ("emergency", "announcement"):
        await manager.broadcast_global(ws_payload)

    return enrich_message(msg, db)


@router.post("/upload-media")
async def upload_chat_media(
    file: UploadFile = File(...),
    media_type: str = Form("image"),  # 'image', 'document', 'voice'
    user: User = Depends(require_any_role)
):
    """Upload image, document, or voice note for chat sharing"""
    contents = await file.read()
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "chat")
    os.makedirs(upload_dir, exist_ok=True)
    
    ext = os.path.splitext(file.filename)[1] or (".webm" if media_type == "voice" else ".png")
    safe_filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(upload_dir, safe_filename)
    
    with open(filepath, "wb") as f:
        f.write(contents)
        
    media_url = f"/static/chat/{safe_filename}"
    return {"media_url": media_url, "media_type": media_type, "filename": file.filename}


@router.get("/conversation/{other_user_id}", response_model=List[MessageOut])
def get_conversation(
    other_user_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    """Get direct chat conversation between current user and another user"""
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == user.id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == user.id)
        ),
        Message.is_deleted == False
    ).order_by(Message.created_at.asc()).all()

    # Mark received unread messages as read & seen
    unread = [m for m in messages if m.receiver_id == user.id and not m.is_read]
    if unread:
        for m in unread:
            m.is_read = True
            m.delivered_status = "seen"
        db.commit()

    return [enrich_message(m, db) for m in messages]


@router.get("/contacts")
def get_chat_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role)
):
    """Get list of users available for chat (Worker ↔ Supervisor ↔ Admin)"""
    users = db.query(User).filter(User.id != current_user.id, User.is_active == True).all()
    contacts = []
    for u in users:
        p = u.profile
        raw_name = p.full_name if p else u.username
        role_label = u.role.capitalize() if u.role else "Worker"
        contacts.append({
            "user_id": u.id,
            "username": u.username,
            "role": u.role,
            "full_name": f"{raw_name} ({role_label})",
            "raw_full_name": raw_name,
            "department": p.department if p else "N/A",
            "online": True
        })
    return contacts


@router.get("/search", response_model=List[MessageOut])
def search_messages(
    query: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    """Search chat messages by content"""
    messages = db.query(Message).filter(
        or_(
            Message.sender_id == user.id,
            Message.receiver_id == user.id
        ),
        Message.content.ilike(f"%{query}%"),
        Message.is_deleted == False
    ).order_by(Message.created_at.desc()).limit(50).all()
    return [enrich_message(m, db) for m in messages]


@router.delete("/{message_id}")
async def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    """Soft delete a message"""
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    if msg.sender_id != user.id and user.role not in ("admin", "supervisor"):
        raise HTTPException(status_code=403, detail="Not authorized to delete this message")

    msg.is_deleted = True
    msg.content = "This message was deleted."
    db.commit()

    # Socket event for delete
    delete_event = {
        "type": "delete_message",
        "id": message_id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id
    }
    if msg.receiver_id:
        await manager.send_personal_message(delete_event, msg.receiver_id)
        await manager.send_personal_message(delete_event, msg.sender_id)

    return {"message": "Message deleted successfully"}


@router.get("/inbox", response_model=List[MessageOut])
def get_inbox(
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    """Get received messages"""
    messages = db.query(Message).filter(
        or_(
            Message.receiver_id == user.id,
            and_(Message.group_target == "all", Message.sender_id != user.id),
            and_(Message.group_target == ("workers" if user.role == "worker" else "admins"), Message.sender_id != user.id),
            Message.message_type == "emergency"
        ),
        Message.is_deleted == False
    ).order_by(Message.created_at.desc()).limit(100).all()

    return [enrich_message(m, db) for m in messages]


@router.put("/{message_id}/read", response_model=MessageOut)
async def mark_message_read(
    message_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    msg.is_read = True
    msg.delivered_status = "seen"
    db.commit()
    db.refresh(msg)

    # Broadcast read receipt to sender
    if msg.sender_id:
        await manager.send_personal_message({
            "type": "message_seen",
            "message_id": msg.id,
            "seen_by": user.id
        }, msg.sender_id)

    return enrich_message(msg, db)


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    count = db.query(Message).filter(
        or_(
            Message.receiver_id == user.id,
            and_(Message.group_target == "all", Message.sender_id != user.id),
            and_(Message.group_target == ("workers" if user.role == "worker" else "admins"), Message.sender_id != user.id)
        ),
        Message.is_read == False,
        Message.is_deleted == False
    ).count()

    return {"unread_count": count}
