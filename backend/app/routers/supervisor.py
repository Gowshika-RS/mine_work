from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
from ..database import get_db
from ..models import User, Shift, LeaveRequest, SupervisorAnnouncement, EquipmentStatus, HazardReport, WorkerProfile
from ..schemas import LeaveRequestCreate, LeaveRequestOut, AnnouncementCreate, AnnouncementOut, EquipmentStatusCreate, EquipmentStatusOut, ShiftAssignmentCreate
from ..auth.security import require_admin, require_any_role
from ..utils.audit_logging import log_audit

router = APIRouter(prefix="/supervisor", tags=["Supervisor"])


def get_supervisor_role(user: User = Depends(require_any_role)) -> User:
    if user.role not in {"admin", "supervisor"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Supervisor access required")
    return user


@router.get("/overview")
def get_supervisor_overview(db: Session = Depends(get_db), supervisor: User = Depends(get_supervisor_role)):
    workers = db.query(User).filter(User.role == "worker").all()
    live_workers = sum(1 for worker in workers if worker.is_active)
    active_shifts = db.query(Shift).filter(Shift.end_time.is_(None)).count()
    today = date.today()
    attendance_today = db.query(Shift).filter(Shift.start_time >= datetime.combine(today, datetime.min.time())).count()
    high_risk = db.query(WorkerProfile).filter(WorkerProfile.safety_score < 80).count()
    active_alerts = db.query(HazardReport).filter(HazardReport.status != "resolved").count()
    pending_hazards = db.query(HazardReport).filter(HazardReport.status == "open").count()
    return {
        "live_workers": live_workers,
        "active_shifts": active_shifts,
        "attendance_today": attendance_today,
        "high_risk_workers": high_risk,
        "active_alerts": active_alerts,
        "pending_hazards": pending_hazards,
        "equipment_status": db.query(EquipmentStatus).count(),
    }


@router.get("/workers", response_model=List[dict])
def list_supervisor_workers(db: Session = Depends(get_db), supervisor: User = Depends(get_supervisor_role)):
    workers = db.query(User).filter(User.role == "worker").all()
    result = []
    for worker in workers:
        profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == worker.id).first()
        result.append({
            "id": worker.id,
            "username": worker.username,
            "email": worker.email,
            "is_active": worker.is_active,
            "full_name": profile.full_name if profile else worker.username,
            "department": profile.department if profile else "N/A",
            "safety_score": float(profile.safety_score) if profile and profile.safety_score is not None else 0.0,
        })
    return result


@router.post("/shifts/assign", response_model=dict)
def assign_shift(payload: ShiftAssignmentCreate, db: Session = Depends(get_db), supervisor: User = Depends(get_supervisor_role)):
    worker = db.query(User).filter(User.id == payload.worker_id, User.role == "worker").first()
    if not worker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")
    new_shift = Shift(worker_id=worker.id, start_time=payload.start_time, end_time=payload.end_time, attendance_status=payload.attendance_status)
    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    log_audit(db, supervisor.id, "SHIFT_ASSIGNED", f"Assigned shift to worker {worker.id}")
    return {"message": "Shift assigned", "shift_id": new_shift.id}


@router.get("/leave-requests", response_model=List[LeaveRequestOut])
def get_leave_requests(db: Session = Depends(get_db), supervisor: User = Depends(get_supervisor_role)):
    return db.query(LeaveRequest).order_by(LeaveRequest.created_at.desc()).all()


@router.post("/leave-requests/{leave_id}/approve")
def approve_leave_request(leave_id: int, db: Session = Depends(get_db), supervisor: User = Depends(get_supervisor_role)):
    leave_request = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")
    leave_request.status = "approved"
    leave_request.reviewed_by = supervisor.id
    leave_request.reviewed_at = datetime.utcnow()
    db.commit()
    log_audit(db, supervisor.id, "LEAVE_APPROVED", f"Approved leave request {leave_id}")
    return {"message": "Leave request approved"}


@router.get("/hazards/pending", response_model=List[dict])
def pending_hazard_reports(db: Session = Depends(get_db), supervisor: User = Depends(get_supervisor_role)):
    hazards = db.query(HazardReport).filter(HazardReport.status == "open").order_by(HazardReport.created_at.desc()).all()
    return [{"id": hazard.id, "hazard_type": hazard.hazard_type, "severity": hazard.severity, "location": hazard.location, "description": hazard.description} for hazard in hazards]


@router.post("/hazards/{hazard_id}/approve")
def approve_hazard(hazard_id: int, db: Session = Depends(get_db), supervisor: User = Depends(get_supervisor_role)):
    hazard = db.query(HazardReport).filter(HazardReport.id == hazard_id).first()
    if not hazard:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hazard report not found")
    hazard.status = "under_review"
    db.commit()
    log_audit(db, supervisor.id, "HAZARD_APPROVED", f"Approved hazard {hazard_id}")
    return {"message": "Hazard report approved"}


@router.get("/health", response_model=List[dict])
def get_worker_health(db: Session = Depends(get_db), supervisor: User = Depends(get_supervisor_role)):
    workers = db.query(User).filter(User.role == "worker").all()
    result = []
    for worker in workers:
        profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == worker.id).first()
        result.append({
            "worker_id": worker.id,
            "name": profile.full_name if profile else worker.username,
            "department": profile.department if profile else "N/A",
            "safety_score": float(profile.safety_score) if profile and profile.safety_score is not None else 0.0,
        })
    return result


@router.get("/announcements", response_model=List[AnnouncementOut])
def list_announcements(db: Session = Depends(get_db), supervisor: User = Depends(get_supervisor_role)):
    return db.query(SupervisorAnnouncement).order_by(SupervisorAnnouncement.created_at.desc()).all()


@router.post("/announcements", response_model=AnnouncementOut)
def create_announcement(payload: AnnouncementCreate, db: Session = Depends(get_db), supervisor: User = Depends(get_supervisor_role)):
    announcement = SupervisorAnnouncement(title=payload.title, message=payload.message, priority=payload.priority, created_by=supervisor.id)
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    log_audit(db, supervisor.id, "ANNOUNCEMENT_CREATED", f"Created announcement {announcement.id}")
    return announcement


@router.get("/equipment", response_model=List[EquipmentStatusOut])
def list_equipment(db: Session = Depends(get_db), supervisor: User = Depends(get_supervisor_role)):
    return db.query(EquipmentStatus).order_by(EquipmentStatus.created_at.desc()).all()


@router.post("/equipment", response_model=EquipmentStatusOut)
def create_equipment(payload: EquipmentStatusCreate, db: Session = Depends(get_db), supervisor: User = Depends(get_supervisor_role)):
    equipment = EquipmentStatus(name=payload.name, category=payload.category, status=payload.status, zone=payload.zone, last_checked_at=payload.last_checked_at)
    db.add(equipment)
    db.commit()
    db.refresh(equipment)
    log_audit(db, supervisor.id, "EQUIPMENT_STATUS_CREATED", f"Created equipment {equipment.id}")
    return equipment
