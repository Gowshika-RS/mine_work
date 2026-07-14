from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import List, Dict, Any
from ..database import get_db
from ..models import HazardReport, SafetyScore, Shift, Location, User, WorkerProfile
from ..auth.security import require_admin, require_worker
from collections import defaultdict

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/incidents/weekly")
def get_weekly_incidents(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Get incident data for the past 7 days"""
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    incidents = db.query(HazardReport).filter(
        and_(
            HazardReport.created_at >= seven_days_ago,
            HazardReport.reporter_id == worker.id
        )
    ).all()
    
    # Group by day
    daily_data = defaultdict(int)
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    for incident in incidents:
        day_index = incident.created_at.weekday()
        day_name = days[day_index]
        daily_data[day_name] += 1
    
    # Ensure all days are represented
    result = [{'name': day, 'value': daily_data.get(day, 0)} for day in days]
    return result


@router.get("/hazards/distribution")
def get_hazard_distribution(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Get distribution of hazards by severity"""
    hazards = db.query(HazardReport).filter(
        HazardReport.reporter_id == worker.id
    ).all()
    
    distribution = {
        'Low': 0,
        'Medium': 0,
        'High': 0,
        'Critical': 0
    }
    
    for hazard in hazards:
        severity = hazard.severity.capitalize()
        if severity in distribution:
            distribution[severity] += 1
    
    return [
        {'name': 'Low', 'value': distribution['Low']},
        {'name': 'Medium', 'value': distribution['Medium']},
        {'name': 'High', 'value': distribution['High']},
        {'name': 'Critical', 'value': distribution['Critical']},
    ]


@router.get("/safety-score/history")
def get_safety_score_history(
    days: int = 30,
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Get safety score trend over time"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    scores = db.query(SafetyScore).filter(
        and_(
            SafetyScore.worker_id == worker.id,
            SafetyScore.timestamp >= cutoff_date
        )
    ).order_by(SafetyScore.timestamp).all()
    
    # Group by day
    daily_avg = {}
    for score in scores:
        date_key = score.timestamp.strftime('%Y-%m-%d')
        if date_key not in daily_avg:
            daily_avg[date_key] = []
        daily_avg[date_key].append(float(score.score))
    
    # Calculate daily average
    result = []
    for date_key in sorted(daily_avg.keys()):
        avg = sum(daily_avg[date_key]) / len(daily_avg[date_key])
        result.append({
            'name': date_key,
            'value': round(avg, 2)
        })
    
    return result


@router.get("/hours-worked/weekly")
def get_weekly_hours(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Get hours worked each day of the week"""
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    shifts = db.query(Shift).filter(
        and_(
            Shift.worker_id == worker.id,
            Shift.start_time >= seven_days_ago
        )
    ).all()
    
    # Group by day
    daily_hours = defaultdict(float)
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    for shift in shifts:
        day_index = shift.start_time.weekday()
        day_name = days[day_index]
        hours = float(shift.total_hours) if shift.total_hours else 0
        daily_hours[day_name] += hours
    
    result = [{'name': day, 'value': round(daily_hours.get(day, 0), 2)} for day in days]
    return result


@router.get("/team/safety-scores")
def get_team_safety_scores(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get all workers' current safety scores (admin only)"""
    workers = db.query(User).filter(User.role == "worker").all()
    
    scores = []
    for worker in workers:
        if worker.profile:
            scores.append({
                'name': worker.profile.full_name or worker.username,
                'score': float(worker.profile.safety_score),
                'worker_id': worker.id
            })
    
    # Sort by score ascending (lowest scores first)
    scores.sort(key=lambda x: x['score'])
    return scores


@router.get("/team/incidents-by-type")
def get_team_incidents_by_type(
    days: int = 30,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get incident distribution by hazard type (admin only)"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    incidents = db.query(HazardReport).filter(
        HazardReport.created_at >= cutoff_date
    ).all()
    
    type_counts = defaultdict(int)
    for incident in incidents:
        type_counts[incident.hazard_type] += 1
    
    result = [
        {'name': hazard_type, 'value': count}
        for hazard_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True)
    ]
    
    return result


@router.get("/team/incidents-timeline")
def get_team_incidents_timeline(
    days: int = 7,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get incident count over time for the team (admin only)"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    incidents = db.query(HazardReport).filter(
        HazardReport.created_at >= cutoff_date
    ).all()
    
    # Group by day
    daily_count = defaultdict(int)
    days_list = []
    for i in range(days):
        date = (datetime.utcnow() - timedelta(days=days - 1 - i)).strftime('%Y-%m-%d')
        days_list.append(date)
        daily_count[date] = 0
    
    for incident in incidents:
        date_key = incident.created_at.strftime('%Y-%m-%d')
        if date_key in daily_count:
            daily_count[date_key] += 1
    
    result = [
        {'name': date, 'value': daily_count[date]}
        for date in days_list
    ]
    
    return result


@router.get("/team/summary")
def get_team_analytics_summary(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get overall team analytics summary (admin only)"""
    workers = db.query(User).filter(User.role == "worker").all()
    
    # Calculate metrics
    total_workers = len(workers)
    avg_safety_score = 0
    if workers:
        scores = [float(w.profile.safety_score) for w in workers if w.profile]
        avg_safety_score = sum(scores) / len(scores) if scores else 0
    
    # Incidents in last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    incidents_week = db.query(HazardReport).filter(
        HazardReport.created_at >= seven_days_ago
    ).count()
    
    # Unresolved incidents
    unresolved_incidents = db.query(HazardReport).filter(
        HazardReport.status != "resolved"
    ).count()
    
    # Average hours worked (today)
    today = datetime.utcnow().date()
    today_shifts = db.query(Shift).filter(
        and_(
            func.DATE(Shift.start_time) == today,
            Shift.total_hours.isnot(None)
        )
    ).all()
    
    avg_hours = 0
    if today_shifts:
        total_hours = sum(float(s.total_hours) for s in today_shifts)
        avg_hours = total_hours / len(today_shifts)
    
    return {
        "total_workers": total_workers,
        "average_safety_score": round(avg_safety_score, 2),
        "incidents_this_week": incidents_week,
        "unresolved_incidents": unresolved_incidents,
        "average_hours_today": round(avg_hours, 2)
    }
