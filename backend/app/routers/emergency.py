from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from ..database import get_db
from ..models import SOSAlert, User, HazardReport, Notification, Location, EquipmentStatus
from ..auth.security import get_current_active_user, require_emergency_handler, require_any_role
from ..websocket import manager
from ..utils.audit_logging import log_audit

router = APIRouter(prefix="/emergency-officer", tags=["Emergency Officer"])

class DispatchRequest(BaseModel):
    sos_id: int
    team_name: str
    responder_notes: str
    priority: str = "CRITICAL"

class BroadcastAlarmRequest(BaseModel):
    zone: str = "ALL"
    alarm_type: str = "EVACUATION"  # EVACUATION, SHELTER_IN_PLACE, TOXIC_GAS_WARNING, FIRE_ALERT
    message: str
    priority: str = "EMERGENCY"

@router.get("/dashboard-stats")
def get_emergency_dashboard_stats(
    db: Session = Depends(get_db),
    officer: User = Depends(require_emergency_handler)
):
    active_sos = db.query(SOSAlert).filter(SOSAlert.status == "active").count()
    acknowledged_sos = db.query(SOSAlert).filter(SOSAlert.status == "acknowledged").count()
    dispatched_sos = db.query(SOSAlert).filter(SOSAlert.status == "dispatched").count()
    total_critical_hazards = db.query(HazardReport).filter(
        HazardReport.status != "resolved",
        HazardReport.severity.in_(["high", "critical"])
    ).count()

    total_workers_active = db.query(User).filter(User.role == "worker", User.is_active == True).count()
    
    return {
        "active_sos_alerts": active_sos,
        "acknowledged_alerts": acknowledged_sos,
        "dispatched_rescue_teams": dispatched_sos,
        "critical_hazards": total_critical_hazards,
        "active_workers_on_site": total_workers_active,
        "rescue_teams_available": 4,
        "gas_status": "NORMAL",
        "ventilation_status": "OPERATIONAL",
        "last_updated": datetime.utcnow().isoformat()
    }

@router.get("/rescue-teams")
def get_rescue_teams(
    db: Session = Depends(get_db),
    officer: User = Depends(require_emergency_handler)
):
    teams = [
        {"id": 1, "name": "Alpha Rescue Squad", "leader": "Captain J. Vance", "status": "AVAILABLE", "members": 5, "zone": "Shaft 1", "phone": "+1-555-0191"},
        {"id": 2, "name": "Bravo Medical Response", "leader": "Dr. E. Rigby", "status": "ON_STANDBY", "members": 4, "zone": "Medical Center", "phone": "+1-555-0192"},
        {"id": 3, "name": "Charlie Gas & Hazmat Squad", "leader": "Eng. R. Miller", "status": "AVAILABLE", "members": 6, "zone": "Zone B Ventilation", "phone": "+1-555-0193"},
        {"id": 4, "name": "Delta Extrication Unit", "leader": "Lt. K. Thorne", "status": "DISPATCHED", "members": 4, "zone": "Deep Mining Level 3", "phone": "+1-555-0194"},
    ]
    return teams

@router.post("/dispatch-rescue")
async def dispatch_rescue_team(
    req: DispatchRequest,
    db: Session = Depends(get_db),
    officer: User = Depends(require_emergency_handler)
):
    sos = db.query(SOSAlert).filter(SOSAlert.id == req.sos_id).first()
    if not sos:
        raise HTTPException(status_code=404, detail="SOS Alert not found")

    sos.status = "dispatched"
    sos.resolved_by = officer.id
    db.commit()

    # Create notification for affected worker
    notif = Notification(
        user_id=sos.worker_id,
        sender_id=officer.id,
        title="🚨 Rescue Team Dispatched",
        message=f"Rescue team '{req.team_name}' has been dispatched to your location. Notes: {req.responder_notes}",
        type="emergency_instruction",
        category="Emergency",
        priority="emergency"
    )
    db.add(notif)
    db.commit()

    log_audit(db, officer.id, "EMERGENCY_DISPATCH", f"Dispatched {req.team_name} for SOS #{sos.id}")

    # Broadcast via WebSocket
    await manager.broadcast_json({
        "type": "SOS_DISPATCHED",
        "sos_id": sos.id,
        "team_name": req.team_name,
        "responder_notes": req.responder_notes,
        "dispatched_by": officer.username
    })

    return {"status": "success", "message": f"Rescue squad '{req.team_name}' successfully dispatched."}

@router.post("/broadcast-alarm")
async def broadcast_alarm(
    req: BroadcastAlarmRequest,
    db: Session = Depends(get_db),
    officer: User = Depends(require_emergency_handler)
):
    users = db.query(User).filter(User.is_active == True).all()
    for u in users:
        notif = Notification(
            user_id=u.id,
            sender_id=officer.id,
            title=f"🚨 EMERGENCY ALARM: {req.alarm_type} [{req.zone}]",
            message=req.message,
            type="emergency_instruction",
            category="Emergency",
            priority="emergency"
        )
        db.add(notif)
    
    db.commit()
    log_audit(db, officer.id, "EMERGENCY_BROADCAST", f"Alarm {req.alarm_type} in {req.zone}: {req.message}")

    # Broadcast real-time emergency WS signal
    await manager.broadcast_json({
        "type": "EMERGENCY_ALARM",
        "alarm_type": req.alarm_type,
        "zone": req.zone,
        "message": req.message,
        "timestamp": datetime.utcnow().isoformat()
    })

    return {"status": "success", "message": f"Emergency alarm broadcasted to {len(users)} personnel."}
