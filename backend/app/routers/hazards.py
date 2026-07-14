from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import HazardReport, HazardImage, User, Notification
from ..schemas import HazardReportOut, HazardReportCreate, HazardReportUpdate
from ..auth.security import get_current_active_user, require_admin, require_any_role
from ..utils.files import save_uploaded_file
from ..websocket import manager
from ..utils.audit_logging import log_audit

router = APIRouter(prefix="/hazards", tags=["Hazards"])

@router.post("/report", response_model=HazardReportOut)
async def report_hazard(
    hazard_in: HazardReportCreate,
    db: Session = Depends(get_db),
    reporter: User = Depends(get_current_active_user)
):
    now = datetime.utcnow()
    new_report = HazardReport(
        reporter_id=reporter.id,
        hazard_type=hazard_in.hazard_type,
        severity=hazard_in.severity,
        description=hazard_in.description,
        location=hazard_in.location,
        status="open"
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    # Broadcast hazard report via WebSocket to all admins
    hazard_payload = {
        "type": "new_hazard",
        "id": new_report.id,
        "hazard_type": new_report.hazard_type,
        "severity": new_report.severity,
        "location": new_report.location,
        "reporter": reporter.username,
        "timestamp": now.strftime("%Y-%m-%d %H:%M:%S")
    }
    await manager.broadcast_to_role(hazard_payload, "admin")
    
    log_audit(db, reporter.id, "HAZARD_REPORTED", f"Hazard ID: {new_report.id}, Type: {new_report.hazard_type}")
    return new_report

@router.post("/{hazard_id}/upload")
def upload_hazard_image(
    hazard_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user)
):
    hazard = db.query(HazardReport).filter(HazardReport.id == hazard_id).first()
    if not hazard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hazard report not found"
        )
        
    # Check permission
    if user.role != "admin" and hazard.reporter_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this report"
        )
        
    file_path = save_uploaded_file(file)
    new_image = HazardImage(
        hazard_report_id=hazard_id,
        image_url=file_path
    )
    db.add(new_image)
    db.commit()
    
    log_audit(db, user.id, "HAZARD_IMAGE_UPLOADED", f"Hazard ID: {hazard_id}, Image URL: {file_path}")
    return {"message": "Image uploaded successfully", "url": file_path}

@router.get("/", response_model=List[HazardReportOut])
def list_hazards(
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    if user.role == "admin":
        # Admin can view all
        return db.query(HazardReport).order_by(HazardReport.created_at.desc()).all()
    else:
        # Worker views what they reported
        return db.query(HazardReport).filter(
            HazardReport.reporter_id == user.id
        ).order_by(HazardReport.created_at.desc()).all()

@router.get("/{hazard_id}", response_model=HazardReportOut)
def get_hazard(
    hazard_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    hazard = db.query(HazardReport).filter(HazardReport.id == hazard_id).first()
    if not hazard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hazard report not found"
        )
        
    if user.role == "worker" and hazard.reporter_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this report"
        )
    return hazard

@router.put("/{hazard_id}/assign", response_model=HazardReportOut)
def assign_investigation(
    hazard_id: int,
    investigator_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    hazard = db.query(HazardReport).filter(HazardReport.id == hazard_id).first()
    if not hazard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hazard report not found"
        )
        
    investigator = db.query(User).filter(User.id == investigator_id).first()
    if not investigator:
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investigator user not found"
        )
         
    hazard.investigator_id = investigator_id
    hazard.status = "under_review"
    db.commit()
    db.refresh(hazard)
    
    # Notify reporter
    if hazard.reporter_id:
        notif = Notification(
            user_id=hazard.reporter_id,
            title="Hazard Investigation Assigned",
            message=f"Your reported hazard ({hazard.hazard_type}) is now under investigation.",
            type="hazard_warning"
        )
        db.add(notif)
        db.commit()
        
    log_audit(db, admin.id, "HAZARD_ASSIGNED", f"Hazard ID: {hazard_id} assigned to Investigator ID: {investigator_id}")
    return hazard

@router.put("/{hazard_id}/resolve", response_model=HazardReportOut)
async def resolve_hazard(
    hazard_id: int,
    remarks: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    hazard = db.query(HazardReport).filter(HazardReport.id == hazard_id).first()
    if not hazard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hazard report not found"
        )
        
    hazard.status = "resolved"
    hazard.remarks = remarks
    db.commit()
    db.refresh(hazard)
    
    # Notify reporter
    if hazard.reporter_id:
        notif = Notification(
            user_id=hazard.reporter_id,
            title="Hazard Resolved",
            message=f"Good news! The hazard you reported ({hazard.hazard_type}) has been resolved. Remarks: {remarks}",
            type="safety_alert"
        )
        db.add(notif)
        db.commit()
        
        # Send live notification via WebSocket if worker is online
        await manager.send_personal_message({
            "type": "safety_alert",
            "title": "Hazard Resolved",
            "message": f"Hazard ({hazard.hazard_type}) at {hazard.location} has been marked as resolved.",
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }, hazard.reporter_id)
        
    log_audit(db, admin.id, "HAZARD_RESOLVED", f"Hazard ID: {hazard_id} resolved. Remarks: {remarks}")
    return hazard
