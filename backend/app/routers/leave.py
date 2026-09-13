from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models import LeaveRequest, User
from ..auth.security import require_any_role, require_supervisor_or_admin, require_admin
from ..utils.audit_logging import log_audit

router = APIRouter(prefix="/leave-requests", tags=["Leave Requests"])


class LeaveCreatePayload(BaseModel):
    worker_id: Optional[int] = None
    reason: str
    start_date: date
    end_date: date


def enrich_leave(req: LeaveRequest, db: Session) -> dict:
    worker = db.query(User).filter(User.id == req.worker_id).first()
    worker_name = worker.profile.full_name if (worker and worker.profile and worker.profile.full_name) else (worker.username if worker else f"User #{req.worker_id}")
    worker_role = worker.role if worker else "worker"
    worker_username = worker.username if worker else "unknown"
    department = worker.profile.department if (worker and worker.profile) else "Operations"

    reviewer_name = None
    if req.reviewed_by:
        rev = db.query(User).filter(User.id == req.reviewed_by).first()
        if rev:
            reviewer_name = rev.profile.full_name if (rev.profile and rev.profile.full_name) else rev.username

    return {
        "id": req.id,
        "worker_id": req.worker_id,
        "worker_name": worker_name,
        "worker_username": worker_username,
        "worker_role": worker_role,
        "department": department,
        "reason": req.reason,
        "start_date": str(req.start_date),
        "end_date": str(req.end_date),
        "status": req.status,
        "reviewed_by": req.reviewed_by,
        "reviewer_name": reviewer_name,
        "reviewed_at": req.reviewed_at.strftime("%Y-%m-%d %H:%M:%S") if req.reviewed_at else None,
        "created_at": req.created_at.strftime("%Y-%m-%d %H:%M:%S") if req.created_at else None,
    }


@router.post("", status_code=210)
@router.post("/")
def create_leave_request(
    payload: LeaveCreatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role)
):
    """Submit a leave request for self (or for specified worker if admin/supervisor)"""
    target_worker_id = payload.worker_id or current_user.id
    if target_worker_id != current_user.id and current_user.role not in ("admin", "supervisor", "emergency_officer"):
        raise HTTPException(status_code=403, detail="Cannot submit leave request for another user")

    if payload.end_date < payload.start_date:
        raise HTTPException(status_code=400, detail="End date cannot be earlier than start date")

    leave_req = LeaveRequest(
        worker_id=target_worker_id,
        reason=payload.reason,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status="pending"
    )
    db.add(leave_req)
    db.commit()
    db.refresh(leave_req)

    log_audit(db, current_user.id, "LEAVE_SUBMITTED", f"Leave request #{leave_req.id} created for User #{target_worker_id}")
    return enrich_leave(leave_req, db)


@router.get("/my")
def get_my_leave_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role)
):
    """Get all leave requests submitted by the logged-in user"""
    requests = db.query(LeaveRequest).filter(
        LeaveRequest.worker_id == current_user.id
    ).order_by(desc(LeaveRequest.created_at)).all()
    return [enrich_leave(r, db) for r in requests]


@router.get("")
@router.get("/")
def get_all_leave_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role)
):
    """Get all leave requests across the system for supervisors, admins, and emergency officers"""
    if current_user.role == "worker":
        # Workers get their own leave requests
        requests = db.query(LeaveRequest).filter(
            LeaveRequest.worker_id == current_user.id
        ).order_by(desc(LeaveRequest.created_at)).all()
    else:
        # Supervisors, Emergency Officers, Admins get all leave requests
        requests = db.query(LeaveRequest).order_by(desc(LeaveRequest.created_at)).all()

    return [enrich_leave(r, db) for r in requests]


@router.post("/{leave_id}/approve")
def approve_leave_request(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role)
):
    """Approve a leave request (Supervisor, Admin, Emergency Officer)"""
    if current_user.role not in ("admin", "supervisor", "emergency_officer"):
        raise HTTPException(status_code=403, detail="Only supervisors, admins, and emergency officers can approve leave requests")

    leave_req = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave_req:
        raise HTTPException(status_code=404, detail="Leave request not found")

    leave_req.status = "approved"
    leave_req.reviewed_by = current_user.id
    leave_req.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(leave_req)

    log_audit(db, current_user.id, "LEAVE_APPROVED", f"Leave request #{leave_id} approved")
    return enrich_leave(leave_req, db)


@router.post("/{leave_id}/reject")
def reject_leave_request(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role)
):
    """Reject a leave request (Supervisor, Admin, Emergency Officer)"""
    if current_user.role not in ("admin", "supervisor", "emergency_officer"):
        raise HTTPException(status_code=403, detail="Only supervisors, admins, and emergency officers can reject leave requests")

    leave_req = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave_req:
        raise HTTPException(status_code=404, detail="Leave request not found")

    leave_req.status = "rejected"
    leave_req.reviewed_by = current_user.id
    leave_req.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(leave_req)

    log_audit(db, current_user.id, "LEAVE_REJECTED", f"Leave request #{leave_id} rejected")
    return enrich_leave(leave_req, db)


@router.delete("/{leave_id}")
def delete_leave_request(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role)
):
    """Delete/Cancel a leave request"""
    leave_req = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave_req:
        raise HTTPException(status_code=404, detail="Leave request not found")

    if leave_req.worker_id != current_user.id and current_user.role not in ("admin", "supervisor"):
        raise HTTPException(status_code=403, detail="Not authorized to delete this leave request")

    db.delete(leave_req)
    db.commit()
    log_audit(db, current_user.id, "LEAVE_DELETED", f"Leave request #{leave_id} deleted")
    return {"message": f"Leave request #{leave_id} removed"}
