from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Report, User, Shift, HazardReport, SOSAlert, WorkerProfile
from ..schemas import ReportOut
from ..auth.security import require_admin
from ..utils.report_generator import generate_excel_report, generate_pdf_report
from ..utils.audit_logging import log_audit

router = APIRouter(prefix="/reports", tags=["Reports Module"])

@router.post("/generate", response_model=ReportOut)
def generate_report(
    report_type: str,  # 'daily', 'weekly', 'monthly', 'hazard', 'attendance', 'incident'
    report_format: str,  # 'pdf', 'excel'
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    # Validate report type
    allowed_types = ['daily', 'weekly', 'monthly', 'hazard', 'attendance', 'incident']
    if report_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid report type. Allowed types: {', '.join(allowed_types)}"
        )
        
    # Validate report format
    if report_format not in ['pdf', 'excel']:
        raise HTTPException(
            status_code=400,
            detail="Invalid format. Use 'pdf' or 'excel'"
        )

    # 1. Fetch real data from DB
    data_list = []
    
    if report_type == 'attendance':
        shifts = db.query(Shift).order_by(Shift.start_time.desc()).all()
        for s in shifts:
            worker_name = s.worker.profile.full_name if s.worker.profile else s.worker.username
            data_list.append({
                "shift_id": s.id,
                "worker_name": worker_name,
                "start_time": s.start_time,
                "end_time": s.end_time,
                "hours_worked": float(s.total_hours) if s.total_hours else 0,
                "attendance_status": s.attendance_status
            })
            
    elif report_type == 'hazard':
        hazards = db.query(HazardReport).order_by(HazardReport.created_at.desc()).all()
        for h in hazards:
            reporter_name = h.reporter.profile.full_name if h.reporter and h.reporter.profile else (h.reporter.username if h.reporter else "N/A")
            data_list.append({
                "hazard_id": h.id,
                "reporter_name": reporter_name,
                "hazard_type": h.hazard_type,
                "severity": h.severity,
                "location": h.location,
                "status": h.status,
                "created_at": h.created_at
            })
            
    elif report_type == 'incident':
        sos = db.query(SOSAlert).order_by(SOSAlert.timestamp.desc()).all()
        for s in sos:
            worker_name = s.worker.profile.full_name if s.worker.profile else s.worker.username
            data_list.append({
                "sos_id": s.id,
                "worker_name": worker_name,
                "latitude": float(s.latitude),
                "longitude": float(s.longitude),
                "alert_type": s.alert_type,
                "status": s.status,
                "timestamp": s.timestamp
            })
            
    else:  # 'daily', 'weekly', 'monthly' summaries
        # Compile a general system safety snapshot
        profiles = db.query(WorkerProfile).all()
        for p in profiles:
            data_list.append({
                "employee_id": p.employee_id,
                "name": p.full_name,
                "department": p.department,
                "safety_score": float(p.safety_score),
                "location": p.mine_location,
                "designation": p.designation
            })

    # 2. Call generator
    if report_format == 'pdf':
        file_path = generate_pdf_report(report_type, data_list)
    else:
        file_path = generate_excel_report(report_type, data_list)

    # 3. Save Report Meta Entry
    new_report = Report(
        title=f"{report_type.capitalize()} Safety Report ({report_format.upper()})",
        type=report_type,
        file_path=file_path,
        created_by=admin.id
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    log_audit(db, admin.id, "REPORT_GENERATED", f"Generated {report_type} report in {report_format} format")
    return new_report

@router.get("/", response_model=List[ReportOut])
def get_all_reports(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    return reports
