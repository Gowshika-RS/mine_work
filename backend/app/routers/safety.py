from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
from decimal import Decimal
from ..database import get_db
from ..models import SafetyScore, WorkerProfile, User, PrecautionChecklist, Shift, HazardReport, Location
from ..schemas import SafetyScoreOut, SafetyScoreCreate, PrecautionChecklistOut, PrecautionChecklistCreate
from ..auth.security import get_current_active_user, require_admin, require_worker, require_any_role
from ..utils.audit_logging import log_audit
from ..utils.risk_calculator import calculate_risk_level

router = APIRouter(prefix="/safety", tags=["Safety"])

# --- Safety Score Management ---

@router.get("/score/{worker_id}", response_model=List[SafetyScoreOut])
def get_worker_score_history(
    worker_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    if user.role == "worker" and user.id != worker_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own safety score history"
        )
        
    scores = db.query(SafetyScore).filter(SafetyScore.worker_id == worker_id).order_by(SafetyScore.timestamp.desc()).all()
    return scores

@router.post("/score/adjust", response_model=SafetyScoreOut)
def adjust_safety_score(
    payload: SafetyScoreCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    worker_profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == payload.worker_id).first()
    if not worker_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker profile not found"
        )
        
    # Cap safety score between 0 and 100
    new_score = max(Decimal("0.00"), min(Decimal("100.00"), payload.score))
    worker_profile.safety_score = new_score
    
    score_log = SafetyScore(
        worker_id=payload.worker_id,
        score=new_score,
        adjusted_by=admin.id,
        reason=payload.reason
    )
    
    db.add(score_log)
    db.commit()
    db.refresh(score_log)
    
    log_audit(
        db, 
        admin.id, 
        "SAFETY_SCORE_ADJUSTED", 
        f"Worker ID: {payload.worker_id}. New score: {new_score}. Reason: {payload.reason}"
    )
    return score_log

# --- Precaution Checklist ---

@router.post("/checklist", response_model=PrecautionChecklistOut)
def submit_checklist(
    checklist_in: PrecautionChecklistCreate,
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    # Verify shift exists if provided
    if checklist_in.shift_id:
        shift = db.query(Shift).filter(Shift.id == checklist_in.shift_id, Shift.worker_id == worker.id).first()
        if not shift:
            raise HTTPException(status_code=404, detail="Active shift not found")
    else:
        # Link to the current open shift if any
        active_shift = db.query(Shift).filter(Shift.worker_id == worker.id, Shift.end_time == None).first()
        checklist_in.shift_id = active_shift.id if active_shift else None
        
    new_checklist = PrecautionChecklist(
        worker_id=worker.id,
        shift_id=checklist_in.shift_id,
        helmet_worn=checklist_in.helmet_worn,
        safety_boots_worn=checklist_in.safety_boots_worn,
        gas_detector_checked=checklist_in.gas_detector_checked,
        emergency_light_working=checklist_in.emergency_light_working,
        communication_device_working=checklist_in.communication_device_working
    )
    
    db.add(new_checklist)
    db.commit()
    db.refresh(new_checklist)
    
    # Calculate a score penalty if anything is unchecked
    unchecked_count = 0
    items = [
        checklist_in.helmet_worn,
        checklist_in.safety_boots_worn,
        checklist_in.gas_detector_checked,
        checklist_in.emergency_light_working,
        checklist_in.communication_device_working
    ]
    for checked in items:
        if not checked:
            unchecked_count += 1
            
    if unchecked_count > 0:
        profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == worker.id).first()
        if profile:
            # Deduct 2.5 points for each missing safety check
            deduction = Decimal(unchecked_count * 2.5)
            profile.safety_score = max(Decimal("0.00"), profile.safety_score - deduction)
            
            score_log = SafetyScore(
                worker_id=worker.id,
                score=profile.safety_score,
                reason=f"Safety deduction: skipped {unchecked_count} precaution checklist items"
            )
            db.add(score_log)
            db.commit()
            log_audit(db, worker.id, "CHECKLIST_PENALTY", f"Deducted {deduction} points due to missing checks")
            
    return new_checklist

@router.get("/checklist/active", response_model=Optional[PrecautionChecklistOut])
def get_active_checklist(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    # Retrieve the checklist submitted during the active shift
    active_shift = db.query(Shift).filter(Shift.worker_id == worker.id, Shift.end_time == None).first()
    if not active_shift:
         return None
    checklist = db.query(PrecautionChecklist).filter(PrecautionChecklist.shift_id == active_shift.id).first()
    return checklist

# --- Recommendation Engine ---

@router.get("/recommendations")
def get_safety_recommendations(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    recommendations = []
    
    # 1. Evaluate Safety Score
    profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == worker.id).first()
    score = profile.safety_score if profile else Decimal("100.00")
    
    if score < 75:
        recommendations.append({
            "category": "Critical score",
            "message": "Your safety score is low. Please review standard underground mine safety guidelines immediately.",
            "severity": "high"
        })
    elif score < 90:
        recommendations.append({
            "category": "Score warning",
            "message": "Double check PPE checklists before going deep into shafts. Keep up safety habits to recover your score.",
            "severity": "medium"
        })
        
    # 2. Evaluate Shift Duration
    active_shift = db.query(Shift).filter(Shift.worker_id == worker.id, Shift.end_time == None).first()
    if active_shift:
        duration = datetime.utcnow() - active_shift.start_time
        hours = duration.total_seconds() / 3600.0
        
        if hours > 8.0:
            recommendations.append({
                "category": "Shift duration warning",
                "message": "You have been on shift for over 8 hours. Please log off and notify your shift supervisor.",
                "severity": "high"
            })
        elif hours > 4.0:
            recommendations.append({
                "category": "Fatigue mitigation",
                "message": "You have worked over 4 hours. Take a 15-minute hydration and rest break.",
                "severity": "medium"
            })
            
    # 3. Check for nearby hazards in the worker's current region
    # Look at the last logged coordinates of this worker
    last_loc = db.query(Location).filter(Location.worker_id == worker.id).order_by(Location.timestamp.desc()).first()
    if last_loc:
        # Search for active open hazards near the worker's area department or locations
        unresolved_hazards = db.query(HazardReport).filter(HazardReport.status != "resolved").all()
        for hazard in unresolved_hazards:
            # We can check if hazard location matches department mine location
            if profile and (profile.mine_location.lower() in hazard.location.lower() or profile.department.lower() in hazard.description.lower()):
                recommendations.append({
                    "category": "Hazard Alert",
                    "message": f"Active {hazard.severity} hazard ({hazard.hazard_type}) reported at {hazard.location}. Wear gas mask/protective gear.",
                    "severity": "high" if hazard.severity in ["high", "critical"] else "medium"
                })
                break
                
    # 4. Standard safety recommendations as defaults
    recommendations.append({
        "category": "General PPE",
        "message": "Ensure your helmet lamp battery is fully charged before entering deep tunnels.",
        "severity": "low"
    })
    recommendations.append({
        "category": "Equipment",
        "message": "Calibrate your handheld gas detector prior to blasting areas.",
        "severity": "low"
    })
    
    return recommendations


# --- Risk Level Assessment ---

@router.get("/risk-level")
def get_my_risk_level(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Get the current worker's risk level assessment"""
    risk_assessment = calculate_risk_level(worker, db)
    return risk_assessment


@router.get("/risk-level/{worker_id}")
def get_worker_risk_level(
    worker_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get a specific worker's risk level (admin only)"""
    worker = db.query(User).filter(User.id == worker_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker not found"
        )
    
    risk_assessment = calculate_risk_level(worker, db)
    return risk_assessment


@router.get("/risk-level/team/all")
def get_team_risk_levels(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get risk levels for all workers in the team (admin only)"""
    
    workers = db.query(User).filter(User.role == "worker").all()
    
    risk_levels = []
    for worker in workers:
        risk_assessment = calculate_risk_level(worker, db)
        risk_levels.append({
            "worker_id": worker.id,
            "username": worker.username,
            "name": worker.profile.full_name if worker.profile else worker.username,
            "risk_level": risk_assessment["risk_level"],
            "risk_score": risk_assessment["risk_score"],
            "color": risk_assessment["color"],
            "timestamp": risk_assessment["timestamp"]
        })
    
    # Sort by risk score (highest first)
    risk_levels.sort(key=lambda x: x["risk_score"], reverse=True)
    
    return {
        "total_workers": len(risk_levels),
        "critical_count": sum(1 for r in risk_levels if r["risk_level"] == "critical"),
        "high_count": sum(1 for r in risk_levels if r["risk_level"] == "high"),
        "medium_count": sum(1 for r in risk_levels if r["risk_level"] == "medium"),
        "low_count": sum(1 for r in risk_levels if r["risk_level"] == "low"),
        "workers": risk_levels
    }
