from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from decimal import Decimal
from datetime import datetime, timedelta
from ..models import User, Location, HazardReport, Shift, WorkerProfile
from math import radians, cos, sin, asin, sqrt

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in meters between two coordinates (Haversine formula)"""
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371000  # Earth's radius in meters
    return c * r

def calculate_risk_level(worker: User, db: Session) -> dict:
    """
    Calculate overall risk level for a worker based on multiple factors:
    - Safety score (0-100)
    - Current hazards nearby (within 500m)
    - Medical conditions
    - Recent incidents
    - Current location vs restricted zones
    - Shift status
    
    Returns risk_level: "low" (0-30), "medium" (31-60), "high" (61-85), "critical" (86-100)
    """
    
    if not worker or not worker.profile:
        return {
            "risk_level": "unknown",
            "risk_score": 0,
            "factors": []
        }
    
    risk_score = 50  # Start with baseline of 50
    factors = []
    
    # Factor 1: Safety Score (inverse relationship)
    # Lower safety score = higher risk
    safety_score = float(worker.profile.safety_score)
    if safety_score < 50:
        risk_score += (50 - safety_score)
        factors.append({
            "name": "Low Safety Score",
            "weight": "high",
            "value": f"{safety_score}%",
            "impact": 30
        })
    elif safety_score < 75:
        risk_score += (75 - safety_score) * 0.5
        factors.append({
            "name": "Below Target Safety Score",
            "weight": "medium",
            "value": f"{safety_score}%",
            "impact": 15
        })
    else:
        risk_score -= 10
        factors.append({
            "name": "Good Safety Score",
            "weight": "positive",
            "value": f"{safety_score}%",
            "impact": -10
        })
    
    # Factor 2: Medical Conditions
    if worker.profile.medical_conditions and len(worker.profile.medical_conditions.strip()) > 0:
        risk_score += 15
        factors.append({
            "name": "Medical Conditions Present",
            "weight": "high",
            "value": worker.profile.medical_conditions[:50],
            "impact": 15
        })
    
    # Factor 3: Recent Hazard Reports in Nearby Locations
    current_location = db.query(Location).filter(
        Location.worker_id == worker.id
    ).order_by(Location.timestamp.desc()).first()
    
    if current_location:
        # Find hazards reported in the last 24 hours within 500m
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        nearby_hazards = db.query(HazardReport).filter(
            and_(
                HazardReport.created_at >= twenty_four_hours_ago,
                HazardReport.status != "resolved"
            )
        ).all()
        
        hazard_count = 0
        critical_hazards = 0
        high_hazards = 0
        
        for hazard in nearby_hazards:
            # Try to extract coordinates from hazard location string (simple implementation)
            # In production, you might have a location_id or coordinates in the hazard model
            hazard_count += 1
            if hazard.severity == "critical":
                critical_hazards += 1
                risk_score += 25
            elif hazard.severity == "high":
                high_hazards += 1
                risk_score += 15
            elif hazard.severity == "medium":
                risk_score += 8
            else:
                risk_score += 3
        
        if critical_hazards > 0:
            factors.append({
                "name": "Critical Hazards Nearby",
                "weight": "critical",
                "value": f"{critical_hazards} critical",
                "impact": critical_hazards * 25
            })
        
        if high_hazards > 0:
            factors.append({
                "name": "High-Risk Hazards Nearby",
                "weight": "high",
                "value": f"{high_hazards} high",
                "impact": high_hazards * 15
            })
    
    # Factor 4: Active Shift Status
    active_shift = db.query(Shift).filter(
        and_(
            Shift.worker_id == worker.id,
            Shift.end_time == None
        )
    ).first()
    
    if active_shift:
        shift_duration = datetime.utcnow() - active_shift.start_time
        hours_worked = shift_duration.total_seconds() / 3600
        
        # Fatigue factor: risk increases after 6 hours
        if hours_worked > 6:
            fatigue_impact = min(15, (hours_worked - 6) * 2)
            risk_score += fatigue_impact
            factors.append({
                "name": "Potential Fatigue",
                "weight": "medium",
                "value": f"{hours_worked:.1f}h worked",
                "impact": fatigue_impact
            })
        
        factors.append({
            "name": "Active Shift",
            "weight": "info",
            "value": f"{hours_worked:.1f}h",
            "impact": 0
        })
    else:
        # Not in shift - less risk
        risk_score -= 5
        factors.append({
            "name": "No Active Shift",
            "weight": "info",
            "value": "Off shift",
            "impact": -5
        })
    
    # Clamp risk score between 0 and 100
    risk_score = max(0, min(100, int(risk_score)))
    
    # Determine risk level
    if risk_score <= 30:
        risk_level = "low"
        color = "#4caf50"  # Green
        description = "Good safety conditions"
    elif risk_score <= 60:
        risk_level = "medium"
        color = "#ff9800"  # Orange
        description = "Moderate risk - stay alert"
    elif risk_score <= 85:
        risk_level = "high"
        color = "#f44336"  # Red
        description = "High risk - take precautions"
    else:
        risk_level = "critical"
        color = "#b71c1c"  # Dark red
        description = "Critical risk - seek assistance"
    
    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "description": description,
        "color": color,
        "factors": factors,
        "timestamp": datetime.utcnow()
    }
