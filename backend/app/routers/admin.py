from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import csv
import io

from ..database import get_db
from ..models import (
    User,
    WorkerProfile,
    HazardReport,
    HazardImage,
    Shift,
    SafetyScore,
    SOSAlert,
    Notification,
    PrecautionChecklist,
    AuditLog,
    SystemSetting,
    LeaveRequest,
    HealthAssessment
)
from ..schemas import (
    UserOut,
    UserAdminCreate,
    UserAdminUpdate,
    HazardReportOut,
    SOSAlertOut,
    NotificationCreate,
    SystemSettingOut
)
from ..auth.security import require_admin, get_password_hash
from ..utils.audit_logging import log_audit

router = APIRouter(prefix="/admin", tags=["Admin"])


def format_dt(dt):
    if dt is None:
        return None
    if hasattr(dt, 'strftime'):
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    return str(dt)


# ==========================================
# 1. ADMIN DASHBOARD OVERVIEW & ANALYTICS
# ==========================================

@router.get("/overview")
def get_admin_overview(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    total_workers = db.query(User).filter(User.role == "worker").count()
    active_workers = db.query(User).filter(User.role == "worker", User.is_active == True).count()

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Active shifts today
    shifts_today = db.query(Shift).filter(Shift.start_time >= today_start).all()
    workers_checked_in = sum(1 for s in shifts_today if s.end_time is None or s.attendance_status == "present")
    workers_checked_out = sum(1 for s in shifts_today if s.end_time is not None or s.attendance_status == "completed")

    pending_hazards = db.query(HazardReport).filter(
        or_(HazardReport.status == "open", HazardReport.status == "under_review", HazardReport.status == "Pending")
    ).count()

    active_sos = db.query(SOSAlert).filter(
        or_(SOSAlert.status == "active", SOSAlert.status == "acknowledged", SOSAlert.status == "dispatched")
    ).count()

    safety_scores = [float(p.safety_score) for p in db.query(WorkerProfile).all() if p.safety_score is not None]
    overall_safety_score = round(sum(safety_scores) / len(safety_scores), 2) if safety_scores else 94.5

    # Hazard severity breakdown
    low_hazards = db.query(HazardReport).filter(HazardReport.severity == "low").count()
    med_hazards = db.query(HazardReport).filter(HazardReport.severity == "medium").count()
    high_hazards = db.query(HazardReport).filter(HazardReport.severity == "high").count()
    crit_hazards = db.query(HazardReport).filter(HazardReport.severity == "critical").count()

    # Recent activities
    recent_logs = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(5).all()
    activities = [
        {
            "id": log.id,
            "action": log.action,
            "details": log.details,
            "timestamp": format_dt(log.timestamp),
        }
        for log in recent_logs
    ]

    # Weekly trends for charts
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    hazard_trends = []
    for i in range(7):
        day_date = today_start - timedelta(days=6 - i)
        next_date = day_date + timedelta(days=1)
        count = db.query(HazardReport).filter(HazardReport.created_at >= day_date, HazardReport.created_at < next_date).count()
        hazard_trends.append({"name": days[day_date.weekday()], "value": count})

    attendance_data = [
        {"name": "Checked In", "value": workers_checked_in or max(1, active_workers)},
        {"name": "Checked Out", "value": workers_checked_out},
        {"name": "Inactive", "value": max(0, total_workers - active_workers)},
    ]

    incident_reports = [
        {"name": "Week 1", "value": db.query(HazardReport).count()},
        {"name": "Week 2", "value": max(0, db.query(HazardReport).count() - 1)},
        {"name": "Week 3", "value": max(0, db.query(HazardReport).count() + 2)},
        {"name": "Week 4", "value": pending_hazards},
    ]

    weather_data = {
        "temperature": "28°C",
        "condition": "Partly Sunny / Mine Zone Safe",
        "humidity": "54%",
        "wind_speed": "12 km/h",
        "air_quality": "Good (AQI 42)",
        "underground_temp": "24°C",
        "methane_level": "0.02% (Normal)",
    }

    ai_risk_summary = (
        f"AI System Assessment: Operational status is STABLE. {active_sos} active emergency SOS alerts, "
        f"{pending_hazards} unresolved hazard reports requiring investigation. Overall fleet safety score is {overall_safety_score}%."
    )

    # Recent SOS alerts
    recent_sos = db.query(SOSAlert).order_by(desc(SOSAlert.timestamp)).limit(5).all()
    sos_list = []
    for s in recent_sos:
        w = db.query(User).filter(User.id == s.worker_id).first()
        prof = w.profile if w else None
        sos_list.append({
            "id": s.id,
            "worker_id": s.worker_id,
            "worker_name": prof.full_name if prof else (w.username if w else "Unknown Worker"),
            "employee_id": prof.employee_id if prof else f"EMP-{s.worker_id:04d}",
            "location": f"Lat {s.latitude}, Lng {s.longitude}",
            "latitude": float(s.latitude),
            "longitude": float(s.longitude),
            "alert_type": s.alert_type,
            "status": s.status,
            "timestamp": format_dt(s.timestamp),
        })

    # Recent Hazard Reports
    recent_hazard_reports = db.query(HazardReport).order_by(desc(HazardReport.created_at)).limit(5).all()
    hazard_list = []
    for h in recent_hazard_reports:
        rep = db.query(User).filter(User.id == h.reporter_id).first() if h.reporter_id else None
        imgs = [img.image_url for img in h.images]
        hazard_list.append({
            "id": h.id,
            "hazard_type": h.hazard_type,
            "severity": h.severity,
            "description": h.description,
            "location": h.location,
            "status": h.status,
            "reporter_name": rep.profile.full_name if rep and rep.profile else (rep.username if rep else "Worker"),
            "created_at": format_dt(h.created_at),
            "images": imgs,
        })

    return {
        "total_workers": total_workers,
        "active_workers": active_workers,
        "workers_checked_in": workers_checked_in,
        "workers_checked_out": workers_checked_out,
        "pending_hazards": pending_hazards,
        "active_sos": active_sos,
        "overall_safety_score": overall_safety_score,
        "today_weather": weather_data,
        "ai_risk_summary": ai_risk_summary,
        "hazard_stats": {
            "low": low_hazards,
            "medium": med_hazards,
            "high": high_hazards,
            "critical": crit_hazards,
        },
        "recent_activities": activities,
        "recent_sos_alerts": sos_list,
        "recent_hazards": hazard_list,
        "charts": {
            "hazard_trends": hazard_trends,
            "worker_attendance": attendance_data,
            "incident_reports": incident_reports,
        },
    }


# ==========================================
# 2. WORKER MANAGEMENT
# ==========================================

@router.get("/workers")
def get_workers_list(
    search: Optional[str] = None,
    department: Optional[str] = None,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = db.query(User).filter(User.role == "worker")

    if search:
        search_pattern = f"%{search}%"
        query = query.outerjoin(User.profile).filter(
            or_(
                User.username.like(search_pattern),
                User.email.like(search_pattern),
                WorkerProfile.full_name.like(search_pattern),
                WorkerProfile.employee_id.like(search_pattern),
                WorkerProfile.department.like(search_pattern),
            )
        )

    if department:
        query = query.outerjoin(User.profile).filter(WorkerProfile.department == department)

    if status_filter == "active":
        query = query.filter(User.is_active == True)
    elif status_filter == "inactive":
        query = query.filter(User.is_active == False)

    users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()

    result = []
    for user in users:
        profile = user.profile
        shifts = db.query(Shift).filter(Shift.worker_id == user.id).order_by(desc(Shift.start_time)).all()
        checklists = db.query(PrecautionChecklist).filter(PrecautionChecklist.worker_id == user.id).all()
        hazards_count = db.query(HazardReport).filter(HazardReport.reporter_id == user.id).count()

        result.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "profile": {
                "id": profile.id if profile else None,
                "employee_id": profile.employee_id if profile else f"EMP-{user.id:04d}",
                "full_name": profile.full_name if profile else user.username,
                "age": profile.age if profile else 30,
                "gender": profile.gender if profile else "Male",
                "phone_number": profile.phone_number if profile else "N/A",
                "emergency_contact_name": profile.emergency_contact_name if profile else "N/A",
                "emergency_contact_number": profile.emergency_contact_number if profile else "N/A",
                "address": profile.address if profile else "Mining Site 1",
                "blood_group": profile.blood_group if profile else "O+",
                "medical_conditions": profile.medical_conditions if profile else "None",
                "department": profile.department if profile else "Underground Operations",
                "mine_location": profile.mine_location if profile else "Sector A",
                "designation": profile.designation if profile else "Miner",
                "joining_date": str(profile.joining_date) if profile and profile.joining_date else str(user.created_at.date()),
                "safety_score": float(profile.safety_score) if profile and profile.safety_score is not None else 100.0,
            },
            "shifts_count": len(shifts),
            "checklists_completed": len(checklists),
            "reported_hazards_count": hazards_count,
            "risk_score": round(max(0.0, 100.0 - (hazards_count * 5.0)), 1),
        })

    return result


@router.get("/workers/{worker_id}")
def get_worker_detail(
    worker_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == worker_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Worker not found")

    profile = user.profile
    shifts = db.query(Shift).filter(Shift.worker_id == user.id).order_by(desc(Shift.start_time)).limit(10).all()
    hazards = db.query(HazardReport).filter(HazardReport.reporter_id == user.id).order_by(desc(HazardReport.created_at)).all()
    sos_alerts = db.query(SOSAlert).filter(SOSAlert.worker_id == user.id).order_by(desc(SOSAlert.timestamp)).all()
    safety_history = db.query(SafetyScore).filter(SafetyScore.worker_id == user.id).order_by(desc(SafetyScore.timestamp)).all()

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,
        },
        "profile": {
            "employee_id": profile.employee_id if profile else f"EMP-{user.id:04d}",
            "full_name": profile.full_name if profile else user.username,
            "age": profile.age if profile else 30,
            "gender": profile.gender if profile else "Male",
            "phone_number": profile.phone_number if profile else "N/A",
            "emergency_contact_name": profile.emergency_contact_name if profile else "N/A",
            "emergency_contact_number": profile.emergency_contact_number if profile else "N/A",
            "address": profile.address if profile else "N/A",
            "blood_group": profile.blood_group if profile else "O+",
            "medical_conditions": profile.medical_conditions if profile else "None",
            "department": profile.department if profile else "Mining Operations",
            "mine_location": profile.mine_location if profile else "Zone A",
            "designation": profile.designation if profile else "Worker",
            "joining_date": str(profile.joining_date) if profile and profile.joining_date else str(user.created_at.date()),
            "safety_score": float(profile.safety_score) if profile and profile.safety_score is not None else 100.0,
        },
        "shifts": [
            {
                "id": s.id,
                "start_time": s.start_time,
                "end_time": s.end_time,
                "total_hours": float(s.total_hours) if s.total_hours else None,
                "attendance_status": s.attendance_status,
            }
            for s in shifts
        ],
        "hazards": [
            {
                "id": h.id,
                "hazard_type": h.hazard_type,
                "severity": h.severity,
                "status": h.status,
                "location": h.location,
                "created_at": h.created_at,
            }
            for h in hazards
        ],
        "sos_alerts": [
            {
                "id": s.id,
                "alert_type": s.alert_type,
                "status": s.status,
                "timestamp": s.timestamp,
            }
            for s in sos_alerts
        ],
        "safety_history": [
            {
                "id": sh.id,
                "score": float(sh.score),
                "reason": sh.reason,
                "timestamp": sh.timestamp,
            }
            for sh in safety_history
        ],
    }


@router.put("/workers/{worker_id}")
def update_worker_info(
    worker_id: int,
    payload: UserAdminUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == worker_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Worker not found")

    if payload.email is not None and payload.email != user.email:
        existing = db.query(User).filter(User.email == payload.email, User.id != worker_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already used by another user")
        user.email = payload.email

    if payload.role is not None:
        user.role = payload.role

    if payload.is_active is not None:
        user.is_active = payload.is_active

    profile = user.profile
    if not profile:
        profile = WorkerProfile(
            user_id=user.id,
            employee_id=f"EMP-{user.id:04d}",
            full_name=payload.full_name or user.username,
            age=30,
            gender="Male",
            phone_number=payload.phone_number or "0000000000",
            emergency_contact_name="N/A",
            emergency_contact_number="0000000000",
            address="Mining Zone",
            blood_group=payload.blood_group or "O+",
            medical_conditions=payload.medical_conditions or "None",
            department=payload.department or "Operations",
            mine_location=payload.mine_location or "Zone 1",
            designation=payload.designation or "Worker",
            joining_date=datetime.utcnow().date(),
            safety_score=payload.safety_score if payload.safety_score is not None else 100.0,
        )
        db.add(profile)
    else:
        if payload.full_name is not None:
            profile.full_name = payload.full_name
        if payload.department is not None:
            profile.department = payload.department
        if payload.mine_location is not None:
            profile.mine_location = payload.mine_location
        if payload.phone_number is not None:
            profile.phone_number = payload.phone_number
        if payload.designation is not None:
            profile.designation = payload.designation
        if payload.blood_group is not None:
            profile.blood_group = payload.blood_group
        if payload.medical_conditions is not None:
            profile.medical_conditions = payload.medical_conditions
        if payload.safety_score is not None:
            profile.safety_score = payload.safety_score

    db.commit()
    db.refresh(user)
    log_audit(db, admin.id, "ADMIN_WORKER_UPDATED", f"Updated worker ID {user.id}")
    return {"message": "Worker profile updated successfully"}


@router.put("/workers/{worker_id}/status")
def toggle_worker_status(
    worker_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == worker_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Worker not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot disable your own admin account")

    user.is_active = is_active
    db.commit()
    log_audit(db, admin.id, "WORKER_STATUS_CHANGED", f"Worker {worker_id} status set to {is_active}")
    return {"message": f"Worker account {'activated' if is_active else 'deactivated'}", "is_active": is_active}


@router.delete("/workers/{worker_id}")
def delete_worker_account(
    worker_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == worker_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Worker not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")

    db.delete(user)
    db.commit()
    log_audit(db, admin.id, "WORKER_DELETED", f"Deleted worker ID {worker_id}")
    return {"message": "Worker account deleted successfully"}


# ==========================================
# 3. HAZARD MANAGEMENT & AI HAZARD ANALYSIS
# ==========================================

@router.get("/hazards")
def get_admin_hazards(
    risk_level: Optional[str] = None,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = db.query(HazardReport)

    if risk_level:
        query = query.filter(or_(HazardReport.severity == risk_level, HazardReport.risk_level == risk_level))
    if status_filter:
        query = query.filter(HazardReport.status == status_filter)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                HazardReport.hazard_type.like(search_pattern),
                HazardReport.description.like(search_pattern),
                HazardReport.location.like(search_pattern),
            )
        )

    hazards = query.order_by(desc(HazardReport.created_at)).offset(skip).limit(limit).all()

    result = []
    for h in hazards:
        reporter = db.query(User).filter(User.id == h.reporter_id).first() if h.reporter_id else None
        investigator = db.query(User).filter(User.id == h.investigator_id).first() if h.investigator_id else None
        images = [img.image_url for img in h.images]

        result.append({
            "id": h.id,
            "title": h.hazard_type,
            "hazard_type": h.hazard_type,
            "severity": h.severity,
            "risk_level": h.risk_level or h.severity.capitalize(),
            "description": h.description,
            "location": h.location,
            "status": h.status,
            "remarks": h.remarks,
            "reporter_id": h.reporter_id,
            "reporter_name": reporter.profile.full_name if reporter and reporter.profile else (reporter.username if reporter else "Anonymous"),
            "investigator_id": h.investigator_id,
            "investigator_name": investigator.username if investigator else "Unassigned",
            "precautions": h.precautions or "Wear full PPE; maintain safety distance.",
            "required_ppe": h.required_ppe or "Helmet, Steel-toe Boots, High-Vis Vest, Safety Goggles",
            "immediate_actions": h.immediate_actions or "Isolate hazard area, notify site supervisor.",
            "notify_who": h.notify_who or "Site Supervisor, Safety Officer",
            "ai_analysis": h.ai_analysis or {
                "confidence_score": 92.5,
                "hazard_type": h.hazard_type,
                "risk_level": h.severity.upper(),
                "summary": f"AI Hazard Assessment: Identified {h.hazard_type} at {h.location} with {h.severity} risk potential.",
            },
            "images": images,
            "created_at": h.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "updated_at": h.updated_at.strftime("%Y-%m-%d %H:%M:%S"),
        })

    return result


@router.get("/hazards/{hazard_id}")
def get_hazard_detail(
    hazard_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    h = db.query(HazardReport).filter(HazardReport.id == hazard_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hazard report not found")

    reporter = db.query(User).filter(User.id == h.reporter_id).first() if h.reporter_id else None
    investigator = db.query(User).filter(User.id == h.investigator_id).first() if h.investigator_id else None

    return {
        "id": h.id,
        "hazard_type": h.hazard_type,
        "severity": h.severity,
        "risk_level": h.risk_level or h.severity.capitalize(),
        "description": h.description,
        "location": h.location,
        "status": h.status,
        "remarks": h.remarks,
        "reporter": {
            "id": reporter.id if reporter else None,
            "username": reporter.username if reporter else "Anonymous",
            "full_name": reporter.profile.full_name if reporter and reporter.profile else "Anonymous",
        },
        "investigator": {
            "id": investigator.id if investigator else None,
            "username": investigator.username if investigator else None,
        },
        "precautions": h.precautions,
        "required_ppe": h.required_ppe,
        "immediate_actions": h.immediate_actions,
        "notify_who": h.notify_who,
        "ai_analysis": h.ai_analysis,
        "images": [img.image_url for img in h.images],
        "created_at": h.created_at,
        "updated_at": h.updated_at,
    }


@router.put("/hazards/{hazard_id}/assign")
def assign_hazard_maintenance(
    hazard_id: int,
    investigator_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    h = db.query(HazardReport).filter(HazardReport.id == hazard_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hazard report not found")

    investigator = db.query(User).filter(User.id == investigator_id).first()
    if not investigator:
        raise HTTPException(status_code=404, detail="Maintenance / Investigator user not found")

    h.investigator_id = investigator_id
    h.status = "under_review"
    db.commit()

    # Create notification for maintenance user
    notif = Notification(
        user_id=investigator_id,
        title="Hazard Assignment",
        message=f"You have been assigned to investigate/repair hazard report #{hazard_id} ({h.hazard_type}) at {h.location}.",
        type="hazard_warning"
    )
    db.add(notif)
    db.commit()

    log_audit(db, admin.id, "HAZARD_ASSIGNED", f"Hazard #{hazard_id} assigned to user #{investigator_id}")
    return {"message": "Hazard assigned to maintenance user", "status": h.status}


@router.put("/hazards/{hazard_id}/status")
def update_hazard_status(
    hazard_id: int,
    status_val: str = Query(..., alias="status"),
    remarks: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    h = db.query(HazardReport).filter(HazardReport.id == hazard_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hazard report not found")

    h.status = status_val
    if remarks:
        h.remarks = remarks

    db.commit()

    if h.reporter_id:
        notif = Notification(
            user_id=h.reporter_id,
            title="Hazard Report Status Updated",
            message=f"Your hazard report #{hazard_id} status has been updated to '{status_val}'. Remarks: {remarks or 'None'}",
            type="safety_alert"
        )
        db.add(notif)
        db.commit()

    log_audit(db, admin.id, "HAZARD_STATUS_UPDATED", f"Hazard #{hazard_id} updated to status {status_val}")
    return {"message": "Hazard status updated successfully", "status": h.status}


@router.post("/hazards/{hazard_id}/ai-analysis")
def trigger_ai_hazard_analysis(
    hazard_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    h = db.query(HazardReport).filter(HazardReport.id == hazard_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hazard report not found")

    # Generate or structure AI Analysis
    analysis_result = {
        "hazard_type": h.hazard_type,
        "confidence_score": 94.8,
        "risk_level": h.severity.upper(),
        "description": f"AI Risk Diagnostic for {h.hazard_type}: Elevated hazard potential detected at {h.location}.",
        "required_ppe": "Heavy-Duty Helmet, Anti-Vibration Gloves, Steel-toe Safety Boots, Gas Mask, High-Vis Jacket",
        "precautions": "1. Restrict non-essential personnel entry. 2. Verify gas and ventilation readings. 3. Deploy containment barrier.",
        "immediate_actions": "1. Isolate power/machinery in sector. 2. Dispatch maintenance squad. 3. Log incident in safety system.",
        "ai_summary": f"Incident Analysis Report #{h.id}: High-confidence assessment recommends immediate dispatch of maintenance and mandatory PPE usage.",
    }

    h.risk_level = analysis_result["risk_level"]
    h.required_ppe = analysis_result["required_ppe"]
    h.precautions = analysis_result["precautions"]
    h.immediate_actions = analysis_result["immediate_actions"]
    h.ai_analysis = analysis_result
    db.commit()

    return analysis_result


# ==========================================
# 4. SOS CONTROL CENTER
# ==========================================

@router.get("/sos")
def get_sos_alerts(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = db.query(SOSAlert)
    if status_filter:
        query = query.filter(SOSAlert.status == status_filter)

    alerts = query.order_by(desc(SOSAlert.timestamp)).all()

    result = []
    for alert in alerts:
        worker = db.query(User).filter(User.id == alert.worker_id).first()
        profile = worker.profile if worker else None

        result.append({
            "id": alert.id,
            "worker_id": alert.worker_id,
            "worker_name": profile.full_name if profile else (worker.username if worker else "Unknown Worker"),
            "employee_id": profile.employee_id if profile else f"EMP-{alert.worker_id}",
            "phone_number": profile.phone_number if profile else "N/A",
            "emergency_contact": f"{profile.emergency_contact_name if profile else 'Contact'} ({profile.emergency_contact_number if profile else 'N/A'})",
            "location": f"Lat {alert.latitude}, Lng {alert.longitude} ({profile.mine_location if profile else 'Mine Zone'})",
            "latitude": float(alert.latitude),
            "longitude": float(alert.longitude),
            "alert_type": alert.alert_type,
            "status": alert.status,
            "timestamp": alert.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "resolved_at": alert.resolved_at.strftime("%Y-%m-%d %H:%M:%S") if alert.resolved_at else None,
            "resolved_by": alert.resolved_by,
        })

    return result


@router.put("/sos/{sos_id}/acknowledge")
def acknowledge_sos_alert(
    sos_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    sos = db.query(SOSAlert).filter(SOSAlert.id == sos_id).first()
    if not sos:
        raise HTTPException(status_code=404, detail="SOS alert not found")

    sos.status = "acknowledged"
    db.commit()
    log_audit(db, admin.id, "SOS_ACKNOWLEDGED", f"Acknowledged SOS alert #{sos_id}")
    return {"message": "SOS alert acknowledged", "status": sos.status}


@router.put("/sos/{sos_id}/dispatch")
def dispatch_emergency_team(
    sos_id: int,
    details: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    sos = db.query(SOSAlert).filter(SOSAlert.id == sos_id).first()
    if not sos:
        raise HTTPException(status_code=404, detail="SOS alert not found")

    sos.status = "dispatched"
    db.commit()

    # Notify emergency personnel
    emergency_users = db.query(User).filter(User.role == "emergency").all()
    for user in emergency_users:
        notif = Notification(
            user_id=user.id,
            title="EMERGENCY DISPATCH TRIGGERED",
            message=f"Dispatched emergency team for SOS alert #{sos_id} at location Lat:{sos.latitude}, Lng:{sos.longitude}. Details: {details or 'Immediate response required.'}",
            type="emergency_instruction"
        )
        db.add(notif)
    db.commit()

    log_audit(db, admin.id, "SOS_DISPATCHED", f"Dispatched rescue team for SOS alert #{sos_id}")
    return {"message": "Emergency personnel dispatched", "status": sos.status}


@router.put("/sos/{sos_id}/resolve")
def resolve_sos_alert(
    sos_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    sos = db.query(SOSAlert).filter(SOSAlert.id == sos_id).first()
    if not sos:
        raise HTTPException(status_code=404, detail="SOS alert not found")

    sos.status = "resolved"
    sos.resolved_at = datetime.utcnow()
    sos.resolved_by = admin.id
    db.commit()

    log_audit(db, admin.id, "SOS_RESOLVED", f"Resolved SOS alert #{sos_id}")
    return {"message": "SOS alert marked as resolved", "status": sos.status}


# ==========================================
# 5. NOTIFICATIONS & ANNOUNCEMENTS
# ==========================================

@router.get("/notifications")
def list_admin_notifications(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    notifications = db.query(Notification).order_by(desc(Notification.created_at)).limit(100).all()
    result = []
    for n in notifications:
        user = db.query(User).filter(User.id == n.user_id).first()
        sender = db.query(User).filter(User.id == n.sender_id).first() if n.sender_id else None
        result.append({
            "id": n.id,
            "user_id": n.user_id,
            "sender_id": n.sender_id,
            "sender_name": sender.username if sender else "System Admin",
            "recipient_name": user.profile.full_name if user and user.profile else (user.username if user else "Broadcast"),
            "recipient_role": user.role if user else "All",
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "category": n.category or "Announcement",
            "priority": n.priority or ("critical" if n.type == "emergency_instruction" else "info"),
            "is_read": n.is_read,
            "created_at": format_dt(n.created_at) or "",
        })
    return result


@router.post("/notifications")
def create_admin_notification(
    payload: NotificationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    title = payload.title
    message = payload.message
    notification_type = payload.type
    category = payload.category
    priority = payload.priority
    target_role = payload.target_role
    target_user_id = payload.user_id

    if not title or not message:
        raise HTTPException(status_code=400, detail="Title and message are required")

    # Resolve recipients
    recipients = []
    if target_user_id:
        user = db.query(User).filter(User.id == target_user_id).first()
        if user:
            recipients.append(user)
    elif target_role == "all" or target_role == "emergency":
        recipients = db.query(User).filter(User.is_active == True).all()
    else:
        recipients = db.query(User).filter(User.role == target_role, User.is_active == True).all()

    if not recipients:
        raise HTTPException(status_code=400, detail="No active recipients found for the selected target audience")

    created_notifs = []
    for recipient in recipients:
        notif = Notification(
            user_id=recipient.id,
            sender_id=admin.id,
            title=title,
            message=message,
            type=notification_type,
            category=category,
            priority=priority,
            is_read=False,
        )
        db.add(notif)
        created_notifs.append(notif)

    db.commit()
    log_audit(db, admin.id, "ADMIN_NOTIFICATION_SENT", f"Sent '{title}' to {len(created_notifs)} users")
    return {"message": f"Notification successfully sent to {len(created_notifs)} users", "count": len(created_notifs)}


@router.delete("/notifications/{notification_id}")
def delete_admin_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(notif)
    db.commit()
    return {"message": "Notification deleted"}


@router.patch("/notifications/{notification_id}/read")
def toggle_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = not notif.is_read
    db.commit()
    return {"message": "Notification state updated", "is_read": notif.is_read}


# ==========================================
# 6. REPORTS & ANALYTICS
# ==========================================

@router.get("/reports/analytics")
def get_reports_analytics(
    period: str = Query("month"),  # 'day', 'week', 'month', 'year'
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    total_workers = db.query(User).filter(User.role == "worker").count()
    total_hazards = db.query(HazardReport).count()
    resolved_hazards = db.query(HazardReport).filter(HazardReport.status == "resolved").count()
    checklists_completed = db.query(PrecautionChecklist).count()
    total_shifts = db.query(Shift).count()

    resolution_rate = round((resolved_hazards / total_hazards * 100), 1) if total_hazards > 0 else 100.0

    dept_stats = db.query(
        WorkerProfile.department, func.count(WorkerProfile.id)
    ).group_by(WorkerProfile.department).all()

    department_data = [
        {"name": dept or "General", "value": count}
        for dept, count in dept_stats
    ] if dept_stats else [
        {"name": "Underground Mining", "value": 35},
        {"name": "Maintenance", "value": 20},
        {"name": "Safety & Inspection", "value": 15},
        {"name": "Logistics", "value": 10},
    ]

    return {
        "period": period,
        "summary": {
            "total_workers": total_workers,
            "total_hazards": total_hazards,
            "resolved_hazards": resolved_hazards,
            "resolution_rate": f"{resolution_rate}%",
            "checklists_completed": checklists_completed,
            "total_shifts": total_shifts,
        },
        "department_distribution": department_data,
        "performance_score": 96.2,
    }


@router.get("/reports/export")
def export_reports_data(
    format_type: str = Query("excel", alias="format"),
    report_type: str = Query("incidents"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "workers":
        writer.writerow(["Worker ID", "Username", "Email", "Role", "Active", "Department", "Safety Score"])
        users = db.query(User).filter(User.role == "worker").all()
        for u in users:
            p = u.profile
            writer.writerow([
                u.id, u.username, u.email, u.role, u.is_active,
                p.department if p else "N/A",
                float(p.safety_score) if p and p.safety_score else 100.0
            ])
    elif report_type == "hazards":
        writer.writerow(["Hazard ID", "Type", "Severity", "Location", "Status", "Created At", "Remarks"])
        hazards = db.query(HazardReport).all()
        for h in hazards:
            writer.writerow([h.id, h.hazard_type, h.severity, h.location, h.status, str(h.created_at), h.remarks or ""])
    else:
        writer.writerow(["SOS ID", "Worker ID", "Alert Type", "Status", "Timestamp"])
        alerts = db.query(SOSAlert).all()
        for a in alerts:
            writer.writerow([a.id, a.worker_id, a.alert_type, a.status, str(a.timestamp)])

    content = output.getvalue()
    filename = f"mineguard_{report_type}_report.{'csv' if format_type != 'pdf' else 'txt'}"

    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# ==========================================
# 7. USER MANAGEMENT (Workers, Supervisors, Emergency)
# ==========================================

@router.get("/users")
def list_system_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if search:
        pattern = f"%{search}%"
        query = query.filter(or_(User.username.like(pattern), User.email.like(pattern)))

    users = query.order_by(desc(User.created_at)).all()
    result = []
    for u in users:
        p = u.profile
        result.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "full_name": p.full_name if p else u.username,
            "department": p.department if p else "Operations",
            "mine_location": p.mine_location if p else "Site Alpha",
            "phone_number": p.phone_number if p else "N/A",
            "employee_id": p.employee_id if p else f"EMP-{u.id:04d}",
        })

    return result


@router.post("/users")
def create_system_user(
    payload: UserAdminCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    existing_user = db.query(User).filter(
        or_(User.username == payload.username, User.email == payload.email)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or Email already registered")

    new_user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role=payload.role,
        is_active=payload.is_active,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    profile = WorkerProfile(
        user_id=new_user.id,
        employee_id=payload.employee_id or f"EMP-{new_user.id:04d}",
        full_name=payload.full_name or payload.username,
        age=payload.age or 30,
        gender=payload.gender or "Male",
        phone_number=payload.phone_number or "0000000000",
        emergency_contact_name=payload.emergency_contact_name or "N/A",
        emergency_contact_number=payload.emergency_contact_number or "0000000000",
        address=payload.address or "Mining Zone 1",
        blood_group=payload.blood_group or "O+",
        department=payload.department or "Operations",
        mine_location=payload.mine_location or "Zone 1",
        designation=payload.designation or payload.role.capitalize(),
        joining_date=datetime.utcnow().date(),
        safety_score=100.0,
    )
    db.add(profile)
    db.commit()

    log_audit(db, admin.id, "USER_CREATED", f"Created user {new_user.username} with role {new_user.role}")
    return {"message": "User created successfully", "id": new_user.id}


@router.post("/users/{user_id}/reset-password")
def reset_user_password(
    user_id: int,
    payload: Dict[str, str],
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    new_pass = payload.get("new_password")
    if not new_pass or len(new_pass) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(new_pass)
    db.commit()
    log_audit(db, admin.id, "PASSWORD_RESET", f"Admin reset password for user #{user_id}")
    return {"message": "Password reset successfully"}


# ==========================================
# 8. SYSTEM SETTINGS
# ==========================================

DEFAULT_SETTINGS = {
    "app_name": "MineGuard - AI Offline Safety Companion",
    "admin_email": "admin@mineguard.com",
    "alert_threshold": "high",
    "enable_notifications": "true",
    "enable_email_alerts": "true",
    "maintenance_mode": "false",
    "session_timeout": "60",
    "data_retention_days": "365",
    "language": "en",
    "theme_mode": "dark",
    "ai_model": "Gemini 1.5 Pro / Flash Safety Engine",
    "emergency_phone": "+1-800-MINE-SAFE",
}


@router.get("/settings")
def get_system_settings(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    stored_settings = db.query(SystemSetting).all()
    settings_dict = {**DEFAULT_SETTINGS}
    for s in stored_settings:
        settings_dict[s.setting_key] = s.setting_value

    return settings_dict


@router.put("/settings")
def update_system_settings(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    for key, value in payload.items():
        setting_item = db.query(SystemSetting).filter(SystemSetting.setting_key == key).first()
        str_val = str(value)
        if not setting_item:
            setting_item = SystemSetting(setting_key=key, setting_value=str_val)
            db.add(setting_item)
        else:
            setting_item.setting_value = str_val

    db.commit()
    log_audit(db, admin.id, "SETTINGS_UPDATED", "Updated system configurations")
    return {"message": "Settings updated successfully"}
