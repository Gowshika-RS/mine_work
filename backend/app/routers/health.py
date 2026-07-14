from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import HealthAssessment, User, Notification
from ..schemas import HealthAssessmentCreate, HealthAssessmentOut
from ..auth.security import require_admin, require_worker, require_any_role
from ..websocket import manager
from ..utils.audit_logging import log_audit

router = APIRouter(prefix="/health", tags=["Health & Fatigue Assessment"])


def generate_recommendation(assessment: HealthAssessmentCreate) -> tuple:
    """Generate health recommendations and severity based on assessment inputs"""
    recommendations = []
    severity = "normal"

    # Fatigue analysis
    if assessment.fatigue_level >= 8:
        recommendations.append("🔴 CRITICAL: Fatigue level is dangerously high. Stop work immediately and take a mandatory rest break of at least 30 minutes.")
        severity = "critical"
    elif assessment.fatigue_level >= 6:
        recommendations.append("🟠 WARNING: Elevated fatigue detected. Take a 15-minute rest break and hydrate before continuing work.")
        if severity != "critical":
            severity = "warning"
    elif assessment.fatigue_level >= 4:
        recommendations.append("🟡 CAUTION: Moderate fatigue noted. Consider a short break within the next hour.")
        if severity not in ("critical", "warning"):
            severity = "caution"

    # Dizziness
    if assessment.dizziness:
        recommendations.append("🔴 ALERT: Dizziness reported. Move to a safe, well-ventilated area immediately. Do not operate heavy machinery. Notify your supervisor.")
        if severity not in ("critical",):
            severity = "critical" if assessment.fatigue_level >= 6 else "warning"

    # Breathing difficulty
    if assessment.breathing_difficulty:
        recommendations.append("🔴 URGENT: Breathing difficulty detected. Exit the work area immediately and move to fresh air. Seek medical attention. Check gas detector readings.")
        severity = "critical"

    # Pain level
    if assessment.pain_level >= 7:
        recommendations.append("🔴 CRITICAL: High pain level reported. Seek immediate medical attention. Do not continue work.")
        severity = "critical"
    elif assessment.pain_level >= 4:
        recommendations.append("🟠 WARNING: Significant pain reported. Visit the on-site medical station for evaluation.")
        if severity not in ("critical",):
            severity = "warning"

    # Injuries
    if assessment.injuries:
        recommendations.append(f"🏥 MEDICAL: Injury reported — '{assessment.injuries}'. Seek first aid or medical attention as needed. Log this as an incident report.")
        if severity not in ("critical",):
            severity = "warning"

    # Hydration
    if assessment.hydration_status == "dehydrated":
        recommendations.append("💧 HYDRATION: You are dehydrated. Drink water immediately — at least 500ml. Avoid caffeine. Take a shade break.")
        if severity not in ("critical", "warning"):
            severity = "caution"
    elif assessment.hydration_status == "low":
        recommendations.append("💧 HYDRATION: Water intake is low. Drink at least 250ml of water within the next 30 minutes.")

    # Good health
    if not recommendations:
        recommendations.append("✅ All vitals within normal range. Stay hydrated and maintain regular breaks. Keep up the good work!")

    return "\n".join(recommendations), severity


@router.post("/assessment", response_model=HealthAssessmentOut)
async def submit_assessment(
    payload: HealthAssessmentCreate,
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Submit a health & fatigue self-assessment"""
    recommendation_text, severity = generate_recommendation(payload)

    assessment = HealthAssessment(
        worker_id=worker.id,
        fatigue_level=payload.fatigue_level,
        dizziness=payload.dizziness,
        breathing_difficulty=payload.breathing_difficulty,
        injuries=payload.injuries,
        pain_level=payload.pain_level,
        hydration_status=payload.hydration_status,
        recommendation=recommendation_text,
        severity=severity
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # Alert supervisor if critical or warning
    if severity in ("critical", "warning"):
        # Create notification for admins
        notif_title = f"⚠️ Health Alert: {worker.profile.full_name if worker.profile else worker.username}"
        notif_msg = f"Worker reported {severity} health status. Fatigue: {payload.fatigue_level}/10"
        if payload.dizziness:
            notif_msg += ", Dizziness"
        if payload.breathing_difficulty:
            notif_msg += ", Breathing Difficulty"
        if payload.injuries:
            notif_msg += f", Injury: {payload.injuries}"

        # Send via WebSocket to admins
        ws_payload = {
            "type": "health_alert",
            "worker_id": worker.id,
            "worker_name": worker.profile.full_name if worker.profile else worker.username,
            "severity": severity,
            "fatigue_level": payload.fatigue_level,
            "message": notif_msg,
            "timestamp": assessment.submitted_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        await manager.broadcast_to_role(ws_payload, "admin")

        log_audit(db, worker.id, "HEALTH_ALERT", f"Severity: {severity}, Fatigue: {payload.fatigue_level}/10")

    return assessment


@router.get("/assessment/history", response_model=List[HealthAssessmentOut])
def get_assessment_history(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Get worker's own assessment history"""
    assessments = db.query(HealthAssessment).filter(
        HealthAssessment.worker_id == worker.id
    ).order_by(HealthAssessment.submitted_at.desc()).limit(30).all()
    return assessments


@router.get("/assessment/latest", response_model=Optional[HealthAssessmentOut])
def get_latest_assessment(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Get worker's most recent assessment"""
    assessment = db.query(HealthAssessment).filter(
        HealthAssessment.worker_id == worker.id
    ).order_by(HealthAssessment.submitted_at.desc()).first()
    return assessment


@router.get("/assessment/all")
def get_all_assessments(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get all workers' latest health assessments (admin only)"""
    workers = db.query(User).filter(User.role == "worker").all()

    result = []
    for worker in workers:
        latest = db.query(HealthAssessment).filter(
            HealthAssessment.worker_id == worker.id
        ).order_by(HealthAssessment.submitted_at.desc()).first()

        result.append({
            "worker_id": worker.id,
            "username": worker.username,
            "name": worker.profile.full_name if worker.profile else worker.username,
            "department": worker.profile.department if worker.profile else "N/A",
            "latest_assessment": {
                "fatigue_level": latest.fatigue_level,
                "dizziness": latest.dizziness,
                "breathing_difficulty": latest.breathing_difficulty,
                "injuries": latest.injuries,
                "pain_level": latest.pain_level,
                "hydration_status": latest.hydration_status,
                "severity": latest.severity,
                "recommendation": latest.recommendation,
                "submitted_at": latest.submitted_at.strftime("%Y-%m-%d %H:%M:%S")
            } if latest else None
        })

    return result
