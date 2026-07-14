from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..models import SOSAlert, User, Notification
from ..schemas import SOSAlertOut, SOSAlertCreate, SOSAlertUpdate
from ..auth.security import get_current_active_user, require_admin, require_worker, require_any_role
from ..websocket import manager
from ..utils.audit_logging import log_audit

router = APIRouter(prefix="/sos", tags=["SOS Emergency"])

@router.post("/trigger", response_model=SOSAlertOut)
async def trigger_sos(
    payload: SOSAlertCreate,
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    now = datetime.utcnow()
    new_sos = SOSAlert(
        worker_id=worker.id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        alert_type=payload.alert_type,
        status="active",
        timestamp=now
    )
    db.add(new_sos)
    db.commit()
    db.refresh(new_sos)
    
    # Write a notification entry for historical logs
    db_notif = Notification(
        user_id=worker.id,
        title="EMERGENCY SOS TRIGGERED",
        message=f"SOS Distress beacon triggered at coordinate ({payload.latitude}, {payload.longitude})",
        type="sos_triggered"
    )
    db.add(db_notif)
    db.commit()
    
    # Broadcast to all admins via WebSocket immediately
    sos_payload = {
        "type": "sos_alert",
        "id": new_sos.id,
        "worker_id": worker.id,
        "worker_name": worker.profile.full_name if worker.profile else worker.username,
        "department": worker.profile.department if worker.profile else "N/A",
        "latitude": str(payload.latitude),
        "longitude": str(payload.longitude),
        "timestamp": now.strftime("%Y-%m-%d %H:%M:%S"),
        "status": "active"
    }
    await manager.broadcast_to_role(sos_payload, "admin")
    
    log_audit(db, worker.id, "SOS_TRIGGERED", f"SOS ID: {new_sos.id} at ({payload.latitude}, {payload.longitude})")
    return new_sos

@router.get("/active", response_model=List[SOSAlertOut])
def get_active_sos(
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    # Active meaning status is not 'resolved'
    alerts = db.query(SOSAlert).filter(SOSAlert.status != "resolved").order_by(SOSAlert.timestamp.desc()).all()
    return alerts

@router.get("/history", response_model=List[SOSAlertOut])
def get_sos_history(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    alerts = db.query(SOSAlert).order_by(SOSAlert.timestamp.desc()).all()
    return alerts

@router.put("/{sos_id}/status", response_model=SOSAlertOut)
async def update_sos_status(
    sos_id: int,
    payload: SOSAlertUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    sos = db.query(SOSAlert).filter(SOSAlert.id == sos_id).first()
    if not sos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SOS record not found"
        )
        
    sos.status = payload.status
    if payload.status == "resolved":
        sos.resolved_at = datetime.utcnow()
        sos.resolved_by = admin.id
        
    db.commit()
    db.refresh(sos)
    
    # Broadcast status change to admins
    status_payload = {
        "type": "sos_status_change",
        "id": sos.id,
        "status": sos.status,
        "resolved_at": sos.resolved_at.strftime("%Y-%m-%d %H:%M:%S") if sos.resolved_at else None
    }
    await manager.broadcast_to_role(status_payload, "admin")
    
    # If resolved, notify worker via WS and save DB notification
    if payload.status == "resolved":
         # Notification
         notif = Notification(
             user_id=sos.worker_id,
             title="SOS Cleared",
             message="Your SOS emergency distress call has been resolved and closed.",
             type="safety_alert"
         )
         db.add(notif)
         db.commit()
         
         await manager.send_personal_message({
             "type": "safety_alert",
             "title": "SOS Cleared",
             "message": "Rescue operations cleared. Safe conditions established.",
             "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
         }, sos.worker_id)
         
    log_audit(db, admin.id, "SOS_STATUS_UPDATED", f"SOS ID: {sos_id} updated to status: {payload.status}")
    return sos
