from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..models import SOSAlert, User, Notification
from ..schemas import SOSAlertOut, SOSAlertCreate, SOSAlertUpdate
from ..auth.security import get_current_active_user, require_admin, require_worker, require_supervisor_or_admin, require_any_role
from ..websocket import manager
from ..utils.audit_logging import log_audit

router = APIRouter(prefix="/sos", tags=["SOS Emergency"])
emergency_router = APIRouter(prefix="/emergency", tags=["Emergency SOS"])

def enrich_sos_alert(alert: SOSAlert, db: Session) -> SOSAlert:
    worker = db.query(User).filter(User.id == alert.worker_id).first()
    if worker:
        w_profile = worker.profile
        raw_name = w_profile.full_name if w_profile else worker.username
        role_label = worker.role.capitalize() if worker.role else "Worker"
        alert.worker_name = f"{raw_name} ({role_label})"
        alert.worker_role = worker.role or "worker"
        alert.employee_id = w_profile.employee_id if w_profile else f"W-{worker.id}"
        alert.department = w_profile.department if w_profile else "Mining Operations"
    else:
        alert.worker_name = "Unknown Worker (Worker)"
        alert.worker_role = "worker"
        alert.employee_id = f"W-{alert.worker_id}"
        alert.department = "Operations"
    return alert

@router.post("/trigger", response_model=SOSAlertOut)
@emergency_router.post("/sos", response_model=SOSAlertOut)
async def trigger_sos(
    payload: SOSAlertCreate,
    db: Session = Depends(get_db),
    worker: User = Depends(require_any_role)
):

    now = datetime.utcnow()
    new_sos = SOSAlert(
        worker_id=worker.id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        alert_type=payload.alert_type or "SOS_TRIGGERED",
        emergency_type=payload.emergency_type or "General Emergency",
        status="active",
        timestamp=now
    )
    db.add(new_sos)
    db.commit()
    db.refresh(new_sos)
    
    worker_raw_name = worker.profile.full_name if worker.profile else worker.username
    worker_role_label = worker.role.capitalize() if worker.role else "Worker"
    worker_formatted_name = f"{worker_raw_name} ({worker_role_label})"
    employee_id = worker.profile.employee_id if worker.profile else f"W-{worker.id}"
    
    # Save a notification entry for historical logs
    db_notif = Notification(
        user_id=worker.id,
        title=f"EMERGENCY SOS: {payload.emergency_type}",
        message=f"User {worker_formatted_name} ({employee_id}) triggered SOS at ({payload.latitude}, {payload.longitude})",
        type="sos_triggered",
        category="Emergency",
        priority="emergency"
    )
    db.add(db_notif)
    db.commit()
    
    # Broadcast to all supervisors and admins via WebSocket immediately
    sos_payload = {
        "type": "sos_alert",
        "id": new_sos.id,
        "worker_id": worker.id,
        "worker_name": worker_formatted_name,
        "worker_role": worker.role or "worker",
        "employee_id": employee_id,
        "department": worker.profile.department if worker.profile else "Mining Ops",
        "latitude": str(payload.latitude),
        "longitude": str(payload.longitude),
        "emergency_type": new_sos.emergency_type,
        "timestamp": now.strftime("%Y-%m-%d %H:%M:%S"),
        "status": "active"
    }
    await manager.broadcast_to_role(sos_payload, "admin")
    await manager.broadcast_to_role(sos_payload, "supervisor")
    
    log_audit(db, worker.id, "SOS_TRIGGERED", f"SOS ID: {new_sos.id} Type: {new_sos.emergency_type} at ({payload.latitude}, {payload.longitude})")
    return enrich_sos_alert(new_sos, db)

@router.get("/active", response_model=List[SOSAlertOut])
def get_active_sos(
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    alerts = db.query(SOSAlert).filter(SOSAlert.status != "resolved").order_by(SOSAlert.timestamp.desc()).all()
    return [enrich_sos_alert(a, db) for a in alerts]

@router.get("/history", response_model=List[SOSAlertOut])
def get_sos_history(
    db: Session = Depends(get_db),
    user: User = Depends(require_supervisor_or_admin)
):
    alerts = db.query(SOSAlert).order_by(SOSAlert.timestamp.desc()).all()
    return [enrich_sos_alert(a, db) for a in alerts]

@router.put("/{sos_id}/status", response_model=SOSAlertOut)
async def update_sos_status(
    sos_id: int,
    payload: SOSAlertUpdate,
    db: Session = Depends(get_db),
    updater: User = Depends(require_supervisor_or_admin)
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
        sos.resolved_by = updater.id
        
    db.commit()
    db.refresh(sos)
    
    updater_name = updater.profile.full_name if updater.profile else updater.username
    updater_role_label = updater.role.capitalize() if updater.role else "Admin"
    updater_formatted = f"{updater_name} ({updater_role_label})"

    # Broadcast status change to admins and supervisors
    status_payload = {
        "type": "sos_status_change",
        "id": sos.id,
        "status": sos.status,
        "emergency_type": sos.emergency_type,
        "resolved_at": sos.resolved_at.strftime("%Y-%m-%d %H:%M:%S") if sos.resolved_at else None,
        "resolved_by_name": updater_formatted,
        "resolved_by_role": updater.role
    }
    await manager.broadcast_to_role(status_payload, "admin")
    await manager.broadcast_to_role(status_payload, "supervisor")
    
    # Send status update directly to the worker who triggered SOS
    await manager.send_personal_message(status_payload, sos.worker_id)
    
    if payload.status == "resolved":
         notif = Notification(
             user_id=sos.worker_id,
             title="SOS Cleared",
             message=f"Emergency distress status updated to resolved by {updater_formatted}.",
             type="safety_alert",
             category="Emergency",
             priority="info"
         )
         db.add(notif)
         db.commit()
         
    log_audit(db, updater.id, "SOS_STATUS_UPDATED", f"SOS ID: {sos_id} updated to status: {payload.status}")
    return enrich_sos_alert(sos, db)

