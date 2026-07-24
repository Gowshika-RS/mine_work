from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Notification, User
from ..schemas import NotificationOut, NotificationCreate
from ..auth.security import get_current_active_user, require_any_role, require_admin
from ..websocket import manager
from ..utils.audit_logging import log_audit

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationOut])
def get_user_notifications(
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    # Retrieve all notifications for user
    notifs = db.query(Notification).filter(
        Notification.user_id == user.id
    ).order_by(Notification.created_at.desc()).all()
    return notifs

@router.put("/{notif_id}/read", response_model=NotificationOut)
def mark_as_read(
    notif_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == user.id
    ).first()
    
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
        
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif

@router.put("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.is_read == False
    ).update({Notification.is_read: True}, synchronize_session=False)
    db.commit()
    return {"message": "All notifications marked as read"}


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    """Get count of unread notifications"""
    count = db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.is_read == False
    ).count()
    return {"unread_count": count}


@router.post("/broadcast")
async def broadcast_notification(
    payload: NotificationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Broadcast a notification to all workers (admin only)"""
    workers = db.query(User).filter(User.role == "worker", User.is_active == True).all()

    for worker in workers:
        notif = Notification(
            user_id=worker.id,
            sender_id=admin.id,
            title=payload.title,
            message=payload.message,
            type=payload.type,
            category=payload.category or "Announcement",
            priority=payload.priority or ("critical" if payload.type == "emergency_instruction" else "info"),
        )
        db.add(notif)

    db.commit()

    # Push via WebSocket
    ws_payload = {
        "type": "broadcast_notification",
        "title": payload.title,
        "message": payload.message,
        "notification_type": payload.type,
        "category": payload.category or "Announcement",
        "priority": payload.priority or "info",
    }
    await manager.broadcast_to_role(ws_payload, "worker")

    log_audit(db, admin.id, "NOTIFICATION_BROADCAST", f"Title: {payload.title}")
    return {"message": f"Notification broadcast to {len(workers)} workers"}


@router.delete("/{notif_id}")
def delete_notification(
    notif_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    query = db.query(Notification).filter(Notification.id == notif_id)
    if user.role != "admin":
        query = query.filter(Notification.user_id == user.id)
    notif = query.first()
    
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
        
    db.delete(notif)
    db.commit()
    return {"message": "Notification deleted successfully"}


@router.post("/weather-alert")
async def send_weather_alert(
    payload: NotificationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Send a weather warning to all users (admin only)"""
    all_users = db.query(User).filter(User.is_active == True).all()

    for user in all_users:
        notif = Notification(
            user_id=user.id,
            title=f"⛈️ Weather Alert: {payload.title}",
            message=payload.message,
            type="hazard_warning"
        )
        db.add(notif)

    db.commit()

    ws_payload = {
        "type": "weather_alert",
        "title": payload.title,
        "message": payload.message,
    }
    await manager.broadcast_to_role(ws_payload, "worker")
    await manager.broadcast_to_role(ws_payload, "admin")

    log_audit(db, admin.id, "WEATHER_ALERT_SENT", f"Alert: {payload.title}")
    return {"message": f"Weather alert sent to {len(all_users)} users"}

