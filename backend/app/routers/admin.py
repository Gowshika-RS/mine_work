from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User, WorkerProfile, HazardReport, Shift, SafetyScore
from ..schemas import UserOut
from ..auth.security import require_admin
from ..utils.audit_logging import log_audit

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/overview")
def get_admin_overview(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    workers = db.query(User).filter(User.role == "worker").all()
    active_workers = sum(1 for worker in workers if worker.is_active)

    total_profiles = db.query(WorkerProfile).count()
    open_incidents = db.query(HazardReport).filter(HazardReport.status != "resolved").count()
    recent_shifts = db.query(Shift).filter(Shift.total_hours.isnot(None)).all()

    avg_hours = 0.0
    if recent_shifts:
        avg_hours = sum(float(shift.total_hours) for shift in recent_shifts if shift.total_hours) / len(recent_shifts)

    safety_scores = [float(profile.safety_score) for profile in db.query(WorkerProfile).all() if profile.safety_score is not None]
    avg_safety_score = round(sum(safety_scores) / len(safety_scores), 2) if safety_scores else 0.0

    return {
        "total_workers": len(workers),
        "active_workers": active_workers,
        "worker_profiles": total_profiles,
        "open_incidents": open_incidents,
        "average_safety_score": avg_safety_score,
        "average_shift_hours": round(avg_hours, 2),
    }

@router.get("/workers", response_model=List[UserOut])
def get_admin_workers(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return db.query(User).filter(User.role == "worker").order_by(User.created_at.desc()).all()

@router.put("/workers/{user_id}/status")
def toggle_admin_worker_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")
    if user.id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot change your own admin status")

    user.is_active = is_active
    db.commit()
    log_audit(db, admin.id, "ADMIN_WORKER_STATUS_CHANGED", f"Toggled worker {user_id} to {'active' if is_active else 'inactive'}")
    return {"message": "Worker status updated", "is_active": is_active}
