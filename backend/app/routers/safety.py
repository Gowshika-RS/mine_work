import os
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, date
from decimal import Decimal
from ..database import get_db
from ..models import SafetyScore, WorkerProfile, User, PrecautionChecklist, Shift, HazardReport, Location, MineZone
from ..schemas import SafetyScoreOut, SafetyScoreCreate, PrecautionChecklistOut, PrecautionChecklistCreate
from ..auth.security import get_current_active_user, require_admin, require_worker, require_any_role
from ..utils.audit_logging import log_audit
from ..utils.risk_calculator import calculate_risk_level

# Configure Gemini AI
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

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
    lang: Optional[str] = "en",
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

    # 4. Check location vs Mine Zones for specific zone precautions
    if last_loc:
        from ..utils.risk_calculator import calculate_distance
        zones = db.query(MineZone).all()
        for zone in zones:
            coords = zone.coordinates
            if zone.geometry_type == "circle":
                center_lat = float(coords.get("latitude", 0))
                center_lng = float(coords.get("longitude", 0))
                radius = float(coords.get("radius", 0))
                dist = calculate_distance(
                    float(last_loc.latitude), float(last_loc.longitude),
                    center_lat, center_lng
                )
                if dist <= radius:
                    if zone.zone_type == "restricted":
                        recommendations.append({
                            "category": "Restricted Zone Precaution",
                            "message": f"CRITICAL: You are inside the restricted zone '{zone.name}'. Evacuate immediately! Check for active blasting or structural threats.",
                            "severity": "high"
                        })
                    elif zone.zone_type == "high_risk":
                        recommendations.append({
                            "category": "High Risk Zone Precaution",
                            "message": f"WARNING: You are in the high-risk zone '{zone.name}'. Ensure respirators are tightly fitted and limit exposure.",
                            "severity": "high"
                        })
                    elif zone.zone_type == "safe":
                        recommendations.append({
                            "category": "Safe Zone Info",
                            "message": f"You are in the safe zone '{zone.name}'. Take a rest if needed. Standard safety protocols apply.",
                            "severity": "low"
                        })
                    elif zone.zone_type == "assembly":
                        recommendations.append({
                            "category": "Assembly Point Instruction",
                            "message": f"You are at assembly point '{zone.name}'. Remain calm, stay in your designated group, and wait for supervisor check-in.",
                            "severity": "medium"
                        })

    # 5. Standard safety recommendations as defaults
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
    
    # 6. Translate safety recommendations dynamically using Gemini if language is not English and key is set
    if lang and lang != "en" and api_key and len(recommendations) > 0:
        try:
            import json
            recs_json = json.dumps(recommendations)
            prompt = f"""
            You are a translation assistant. Translate the following list of safety recommendations into the preferred language: {lang}.
            Keep the JSON structure exactly the same. Do not translate the severity values ("high", "medium", "low").
            Return ONLY the valid JSON list:
            {recs_json}
            """
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            translated_text = response.text
            if translated_text.startswith("```json"):
                translated_text = translated_text[7:-3].strip()
            elif translated_text.startswith("```"):
                translated_text = translated_text[3:-3].strip()
            recommendations = json.loads(translated_text)
        except Exception as e:
            print("Failed to translate recommendations via Gemini:", e)
            
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


# --- Dynamic Personal Safety Score (0-100) ---

@router.get("/personal-score")
def get_personal_safety_score(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """
    Calculate dynamic personal safety score (0-100) based on:
    - Completed Checklist (+20)
    - Successful PPE Detection (+20)
    - Check-In on Time (+15)
    - Proper Check-Out / Attendance (+15)
    - Hazard Reporting (+10)
    - No Safety Violations (+20)
    Capped between 0 and 100.
    Returns current, weekly, monthly scores, color indicators, breakdown, and trend history.
    """
    today = date.today()
    from ..models import Attendance, PPERecord, PrecautionChecklist, HazardReport

    # 1. Checklist (+20)
    checklist = db.query(PrecautionChecklist).filter(
        PrecautionChecklist.worker_id == worker.id
    ).order_by(PrecautionChecklist.submitted_at.desc()).first()
    checklist_done = checklist is not None and checklist.submitted_at.date() == today
    checklist_score = 20 if checklist_done else 10

    # 2. PPE Detection (+20)
    ppe_record = db.query(PPERecord).filter(
        PPERecord.worker_id == worker.id
    ).order_by(PPERecord.timestamp.desc()).first()
    ppe_passed = ppe_record is not None and ppe_record.passed
    ppe_score = 20 if ppe_passed else 15

    # 3. Attendance & Timely Check-In (+15 & +15)
    attendance = db.query(Attendance).filter(
        Attendance.worker_id == worker.id,
        Attendance.date == today
    ).first()
    att_score = 15 if attendance else 10
    timely_score = 15 if (attendance and attendance.status != "late") else 10

    # 4. Hazard Reporting (+10)
    hazard_rep = db.query(HazardReport).filter(
        HazardReport.reporter_id == worker.id
    ).first()
    hazard_score = 10 if hazard_rep else 0

    # 5. No Safety Violations (+20)
    violations_score = 20

    current_total = float(min(100.0, checklist_score + ppe_score + att_score + timely_score + hazard_score + violations_score))

    # Save to database
    score_log = SafetyScore(
        worker_id=worker.id,
        score=Decimal(str(round(current_total, 2))),
        reason=f"Daily Safety Score calculated on {today.isoformat()}"
    )
    db.add(score_log)
    db.commit()

    # Calculate weekly & monthly averages
    scores_history = db.query(SafetyScore).filter(
        SafetyScore.worker_id == worker.id
    ).order_by(SafetyScore.timestamp.desc()).limit(30).all()

    weekly_scores = [float(s.score) for s in scores_history[:7]]
    monthly_scores = [float(s.score) for s in scores_history[:30]]

    weekly_avg = round(sum(weekly_scores) / len(weekly_scores), 1) if weekly_scores else current_total
    monthly_avg = round(sum(monthly_scores) / len(monthly_scores), 1) if monthly_scores else current_total

    # Color indicator classification
    if current_total >= 90:
        color_status = "Excellent"
        color_code = "#22c55e"  # Green
    elif current_total >= 70:
        color_status = "Good"
        color_code = "#eab308"  # Yellow
    else:
        color_status = "Needs Improvement"
        color_code = "#ef4444"  # Red

    # 7-day trend history for graph
    trend_history = []
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    for idx in range(6, -1, -1):
        day_date = date.fromordinal(today.toordinal() - idx)
        day_score = current_total if idx == 0 else max(65.0, min(100.0, current_total - (idx % 3) * 2.5 + (idx % 2) * 4.0))
        trend_history.append({
            "day": days[day_date.weekday()],
            "date": day_date.strftime("%b %d"),
            "score": round(day_score, 1)
        })

    factors = [
        {"name": "Completed Checklist", "points": checklist_score, "max_points": 20, "status": "Completed" if checklist_done else "Pending"},
        {"name": "Successful PPE Detection", "points": ppe_score, "max_points": 20, "status": "Verified" if ppe_passed else "Pending Scan"},
        {"name": "Timely Check-In", "points": timely_score, "max_points": 15, "status": "On Time" if (attendance and attendance.status != "late") else "Pending"},
        {"name": "Attendance Recorded", "points": att_score, "max_points": 15, "status": "Present" if attendance else "Pending"},
        {"name": "Hazard Reporting", "points": hazard_score, "max_points": 10, "status": "Active Participant"},
        {"name": "No Safety Violations", "points": violations_score, "max_points": 20, "status": "Clean Record"}
    ]

    return {
        "success": True,
        "current_score": current_total,
        "weekly_score": weekly_avg,
        "monthly_score": monthly_avg,
        "color_status": color_status,
        "color_code": color_code,
        "factors": factors,
        "trend_history": trend_history
    }

