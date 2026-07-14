from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from ..database import get_db
from ..models import Message, User
from ..schemas import MessageCreate, MessageOut
from ..auth.security import require_admin, require_worker, require_any_role
from ..websocket import manager
from ..utils.audit_logging import log_audit

router = APIRouter(prefix="/messages", tags=["Communication Module"])


@router.post("/send", response_model=MessageOut)
async def send_message(
    payload: MessageCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    """Send a direct or group message"""
    if payload.message_type == "direct" and not payload.receiver_id:
        raise HTTPException(
            status_code=400,
            detail="receiver_id is required for direct messages"
        )

    if payload.message_type in ("announcement", "emergency") and user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admins can send announcements and emergency messages"
        )

    msg = Message(
        sender_id=user.id,
        receiver_id=payload.receiver_id,
        group_target=payload.group_target,
        message_type=payload.message_type,
        content=payload.content
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    # Push via WebSocket for real-time delivery
    ws_payload = {
        "type": "new_message",
        "message_id": msg.id,
        "sender_id": user.id,
        "sender_name": user.profile.full_name if user.profile else user.username,
        "message_type": payload.message_type,
        "content": payload.content,
        "timestamp": msg.created_at.strftime("%Y-%m-%d %H:%M:%S")
    }

    if payload.message_type == "direct" and payload.receiver_id:
        await manager.send_personal_message(ws_payload, payload.receiver_id)
    elif payload.group_target == "workers":
        await manager.broadcast_to_role(ws_payload, "worker")
    elif payload.group_target == "admins":
        await manager.broadcast_to_role(ws_payload, "admin")
    elif payload.group_target == "all" or payload.message_type == "emergency":
        await manager.broadcast_to_role(ws_payload, "worker")
        await manager.broadcast_to_role(ws_payload, "admin")

    return msg


@router.get("/inbox", response_model=List[MessageOut])
def get_inbox(
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    """Get received messages (direct + group/broadcast)"""
    messages = db.query(Message).filter(
        or_(
            Message.receiver_id == user.id,
            and_(
                Message.group_target == "all",
                Message.sender_id != user.id
            ),
            and_(
                Message.group_target == ("workers" if user.role == "worker" else "admins"),
                Message.sender_id != user.id
            ),
            Message.message_type == "emergency"
        )
    ).order_by(Message.created_at.desc()).limit(100).all()

    return messages


@router.get("/sent", response_model=List[MessageOut])
def get_sent_messages(
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    """Get sent messages"""
    messages = db.query(Message).filter(
        Message.sender_id == user.id
    ).order_by(Message.created_at.desc()).limit(100).all()
    return messages


@router.post("/announcement", response_model=MessageOut)
async def send_announcement(
    payload: MessageCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Broadcast an announcement to all workers (admin only)"""
    msg = Message(
        sender_id=admin.id,
        group_target=payload.group_target or "all",
        message_type="announcement",
        content=payload.content
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    ws_payload = {
        "type": "announcement",
        "message_id": msg.id,
        "sender_name": admin.profile.full_name if admin.profile else admin.username,
        "content": payload.content,
        "timestamp": msg.created_at.strftime("%Y-%m-%d %H:%M:%S")
    }
    await manager.broadcast_to_role(ws_payload, "worker")
    await manager.broadcast_to_role(ws_payload, "admin")

    log_audit(db, admin.id, "ANNOUNCEMENT_SENT", f"Message: {payload.content[:100]}")
    return msg


@router.post("/emergency", response_model=MessageOut)
async def send_emergency_message(
    payload: MessageCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Send an emergency broadcast to everyone (admin only)"""
    msg = Message(
        sender_id=admin.id,
        group_target="all",
        message_type="emergency",
        content=payload.content
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    ws_payload = {
        "type": "emergency_broadcast",
        "message_id": msg.id,
        "content": payload.content,
        "timestamp": msg.created_at.strftime("%Y-%m-%d %H:%M:%S")
    }
    await manager.broadcast_to_role(ws_payload, "worker")
    await manager.broadcast_to_role(ws_payload, "admin")

    log_audit(db, admin.id, "EMERGENCY_BROADCAST", f"Emergency: {payload.content[:100]}")
    return msg


@router.put("/{message_id}/read", response_model=MessageOut)
def mark_message_read(
    message_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    """Mark a message as read"""
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    msg.is_read = True
    db.commit()
    db.refresh(msg)
    return msg


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    """Get count of unread messages"""
    count = db.query(Message).filter(
        or_(
            Message.receiver_id == user.id,
            and_(
                Message.group_target == "all",
                Message.sender_id != user.id
            ),
            and_(
                Message.group_target == ("workers" if user.role == "worker" else "admins"),
                Message.sender_id != user.id
            )
        ),
        Message.is_read == False
    ).count()

    return {"unread_count": count}
