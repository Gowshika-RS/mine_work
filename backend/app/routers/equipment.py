import os
import uuid
import base64
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import EquipmentIssueReport, User, Notification
from ..schemas import EquipmentIssueReportOut, EquipmentIssueReportCreate
from ..auth.security import require_worker, require_any_role, require_supervisor_or_admin
from ..config import settings

router = APIRouter(prefix="/equipment", tags=["Equipment Issue Reporting"])


@router.post("/report")
def create_equipment_issue_report(
    payload: Optional[EquipmentIssueReportCreate] = None,
    equipment_type: Optional[str] = Form(None),
    equipment_id: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    priority: Optional[str] = Form("Medium"),
    description: Optional[str] = Form(None),
    photo_base64: Optional[str] = Form(None),
    voice_base64: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """
    Workers report equipment issues (Broken Helmet, Damaged Drill, Faulty Machine,
    Gas Sensor Failure, Broken Rope, Electrical Problem) with photo, voice, description, and priority.
    Automatically creates instant notifications for Admin and Supervisor.
    """
    eq_type = payload.equipment_type if payload else equipment_type
    eq_id = (payload.equipment_id if payload else equipment_id) or f"EQP-{uuid.uuid4().hex[:6].upper()}"
    eq_loc = payload.location if payload else location
    eq_prio = (payload.priority if payload else priority) or "Medium"
    eq_desc = payload.description if payload else description
    p_b64 = payload.photo_base64 if payload else photo_base64
    v_b64 = payload.voice_base64 if payload else voice_base64

    if not eq_type or not eq_loc or not eq_desc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Equipment type, location, and description are required"
        )

    # Handle Photo file upload / base64
    photo_url = None
    if p_b64:
        try:
            b64 = p_b64.split(",")[1] if "," in p_b64 else p_b64
            img_bytes = base64.b64decode(b64)
            os.makedirs(os.path.join(settings.UPLOAD_DIR, "equipment"), exist_ok=True)
            fname = f"eq_photo_{uuid.uuid4().hex[:8]}.jpg"
            fpath = os.path.join(settings.UPLOAD_DIR, "equipment", fname)
            with open(fpath, "wb") as f:
                f.write(img_bytes)
            photo_url = f"/static/equipment/{fname}"
        except Exception as e:
            print("Failed to save equipment photo:", e)

    # Handle Voice file base64
    voice_url = None
    if v_b64:
        try:
            b64 = v_b64.split(",")[1] if "," in v_b64 else v_b64
            audio_bytes = base64.b64decode(b64)
            os.makedirs(os.path.join(settings.UPLOAD_DIR, "equipment"), exist_ok=True)
            vname = f"eq_voice_{uuid.uuid4().hex[:8]}.webm"
            vpath = os.path.join(settings.UPLOAD_DIR, "equipment", vname)
            with open(vpath, "wb") as f:
                f.write(audio_bytes)
            voice_url = f"/static/equipment/{vname}"
        except Exception as e:
            print("Failed to save equipment voice note:", e)

    # Create report entry
    report = EquipmentIssueReport(
        worker_id=worker.id,
        equipment_type=eq_type,
        equipment_id=eq_id,
        location=eq_loc,
        priority=eq_prio,
        description=eq_desc,
        photo_url=photo_url,
        voice_url=voice_url,
        status="Submitted",
        assigned_to="Maintenance Crew"
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    # Create instant notification for Supervisors & Admins
    supervisors_and_admins = db.query(User).filter(User.role.in_(["supervisor", "admin"])).all()
    for recipient in supervisors_and_admins:
        notif = Notification(
            user_id=recipient.id,
            sender_id=worker.id,
            title=f"⚠️ {eq_prio.upper()} Equipment Issue: {eq_type}",
            message=f"Worker {worker.username} reported '{eq_type}' ({eq_id}) issue at {eq_loc}: {eq_desc[:80]}...",
            type="safety_alert",
            category="Equipment",
            priority="critical" if eq_prio.lower() in ["high", "critical"] else "warning"
        )
        db.add(notif)
    db.commit()

    return {
        "success": True,
        "message": "Equipment issue report submitted successfully! Maintenance team and supervisors notified.",
        "report": {
            "id": report.id,
            "equipment_type": report.equipment_type,
            "equipment_id": report.equipment_id,
            "location": report.location,
            "priority": report.priority,
            "description": report.description,
            "photo_url": report.photo_url,
            "voice_url": report.voice_url,
            "status": report.status,
            "created_at": report.created_at.isoformat()
        }
    }


@router.get("/my-reports")
def get_worker_equipment_reports(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Fetch complete issue history for current worker."""
    reports = db.query(EquipmentIssueReport).filter(
        EquipmentIssueReport.worker_id == worker.id
    ).order_by(EquipmentIssueReport.created_at.desc()).all()

    return {
        "success": True,
        "count": len(reports),
        "reports": [
            {
                "id": r.id,
                "equipment_id": r.equipment_id,
                "equipment_name": r.equipment_type,
                "category": r.equipment_type,
                "location": r.location,
                "urgency": r.priority,
                "priority": r.priority,
                "description": r.description,
                "photo_url": r.photo_url,
                "voice_url": r.voice_url,
                "status": r.status,
                "assigned_to": r.assigned_to,
                "reported_at": r.created_at.isoformat()
            }
            for r in reports
        ]
    }


@router.get("/reports")
def get_all_equipment_reports(
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    """Fetch equipment issue reports (for worker history and admin/supervisor views)."""
    reports = db.query(EquipmentIssueReport).order_by(EquipmentIssueReport.created_at.desc()).all()

    return {
        "success": True,
        "count": len(reports),
        "reports": [
            {
                "id": r.id,
                "equipment_id": r.equipment_id,
                "equipment_name": r.equipment_type,
                "category": r.equipment_type,
                "location": r.location,
                "urgency": r.priority,
                "priority": r.priority,
                "description": r.description,
                "photo_url": r.photo_url,
                "voice_url": r.voice_url,
                "status": r.status,
                "assigned_to": r.assigned_to,
                "reported_by": r.worker.username if r.worker else "Worker",
                "reported_at": r.created_at.isoformat()
            }
            for r in reports
        ]
    }


@router.put("/reports/{report_id}/status")
def update_equipment_report_status(
    report_id: int,
    status_val: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_supervisor_or_admin)
):
    """Update report status: Submitted, Under Review, In Progress, Resolved, Rejected."""
    report = db.query(EquipmentIssueReport).filter(EquipmentIssueReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Equipment report not found")

    report.status = status_val
    report.updated_at = datetime.now()
    db.commit()

    return {
        "success": True,
        "message": f"Report status updated to '{status_val}'",
        "report_id": report.id,
        "status": report.status
    }
