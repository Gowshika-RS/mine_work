from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date, time
from decimal import Decimal
from typing import List, Optional
from ..database import get_db
from ..models import Shift, User
from ..schemas import ShiftOut
from ..auth.security import get_current_active_user, require_admin, require_worker, require_any_role
from ..utils.audit_logging import log_audit

router = APIRouter(prefix="/shifts", tags=["Shifts"])

@router.post("/start", response_model=ShiftOut)
def start_shift(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    # Check if there is an active shift
    active_shift = db.query(Shift).filter(
        Shift.worker_id == worker.id,
        Shift.end_time == None
    ).first()
    
    if active_shift:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active shift. Please end it first."
        )
        
    now = datetime.utcnow()
    # Check if late (e.g. shift usually starts at 8 AM local time, let's say after 9 AM is late, but default to present)
    status_str = "present"
    
    new_shift = Shift(
        worker_id=worker.id,
        start_time=now,
        attendance_status=status_str
    )
    
    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    
    log_audit(db, worker.id, "SHIFT_STARTED", f"Shift ID: {new_shift.id}")
    return new_shift

@router.post("/end", response_model=ShiftOut)
def end_shift(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    active_shift = db.query(Shift).filter(
        Shift.worker_id == worker.id,
        Shift.end_time == None
    ).first()
    
    if not active_shift:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active shift found to end."
        )
        
    now = datetime.utcnow()
    active_shift.end_time = now
    
    # Calculate duration
    duration = now - active_shift.start_time
    hours = Decimal(duration.total_seconds() / 3600.0)
    active_shift.total_hours = round(hours, 2)
    active_shift.attendance_status = "completed"
    
    db.commit()
    db.refresh(active_shift)
    
    log_audit(db, worker.id, "SHIFT_ENDED", f"Shift ID: {active_shift.id}, Duration: {active_shift.total_hours} hours")
    return active_shift

@router.get("/active", response_model=Optional[ShiftOut])
def get_active_shift(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    active_shift = db.query(Shift).filter(
        Shift.worker_id == worker.id,
        Shift.end_time == None
    ).first()
    return active_shift

@router.get("/history", response_model=List[ShiftOut])
def get_shift_history(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    shifts = db.query(Shift).filter(Shift.worker_id == worker.id).order_by(Shift.start_time.desc()).all()
    return shifts

@router.get("/admin/history", response_model=List[ShiftOut])
def get_all_shift_history(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    shifts = db.query(Shift).order_by(Shift.start_time.desc()).all()
    return shifts


# Shift Schedule Management (Shift Hours Setup)
@router.get("/schedule/current")
def get_current_shift_schedule(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Get the current shift schedule (shift hours) for a worker"""
    # Get the most recent shift with end_time to extract the schedule
    recent_shift = db.query(Shift).filter(
        Shift.worker_id == worker.id
    ).order_by(Shift.start_time.desc()).first()
    
    if recent_shift:
        return {
            "shift_start_time": recent_shift.start_time.strftime("%H:%M") if recent_shift.start_time else "08:00",
            "shift_end_time": recent_shift.end_time.strftime("%H:%M") if recent_shift.end_time else "16:00",
            "total_hours": float(recent_shift.total_hours) if recent_shift.total_hours else 8.0
        }
    else:
        return {
            "shift_start_time": "08:00",
            "shift_end_time": "16:00",
            "total_hours": 8.0
        }


@router.post("/schedule/update")
def update_shift_schedule(
    shift_start_time: str,
    shift_end_time: str,
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Update the shift schedule (shift hours) for a worker"""
    try:
        # Parse shift times (format: "HH:MM")
        start_parts = shift_start_time.split(':')
        end_parts = shift_end_time.split(':')
        
        start_time_obj = time(int(start_parts[0]), int(start_parts[1]))
        end_time_obj = time(int(end_parts[0]), int(end_parts[1]))
        
        # Create datetime objects for today
        today = date.today()
        start_datetime = datetime.combine(today, start_time_obj)
        end_datetime = datetime.combine(today, end_time_obj)
        
        # Calculate total hours
        duration = end_datetime - start_datetime
        total_hours = round(duration.total_seconds() / 3600, 2)
        
        # Update or create shift record
        shift = db.query(Shift).filter(
            Shift.worker_id == worker.id,
            Shift.start_time >= datetime.combine(today, time.min),
            Shift.start_time <= datetime.combine(today, time.max)
        ).first()
        
        if shift:
            shift.start_time = start_datetime
            shift.end_time = end_datetime
            shift.total_hours = total_hours
        else:
            shift = Shift(
                worker_id=worker.id,
                start_time=start_datetime,
                end_time=end_datetime,
                total_hours=total_hours,
                attendance_status="present"
            )
            db.add(shift)
        
        db.commit()
        db.refresh(shift)
        
        log_audit(db, worker.id, "SHIFT_SCHEDULE_UPDATED", 
                  f"New schedule: {shift_start_time} - {shift_end_time} ({total_hours}h)")
        
        return {
            "success": True,
            "message": "Shift schedule updated successfully",
            "shift_start_time": shift_start_time,
            "shift_end_time": shift_end_time,
            "total_hours": total_hours
        }
    except (ValueError, IndexError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid time format. Please use HH:MM format. Error: {str(e)}"
        )


@router.post("/safe-exit")
def confirm_safe_exit(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Confirm safe exit from the mine"""
    active_shift = db.query(Shift).filter(
        Shift.worker_id == worker.id,
        Shift.end_time == None
    ).first()

    if active_shift:
        now = datetime.utcnow()
        active_shift.end_time = now
        duration = now - active_shift.start_time
        hours = Decimal(duration.total_seconds() / 3600.0)
        active_shift.total_hours = round(hours, 2)
        active_shift.attendance_status = "completed"
        db.commit()
        db.refresh(active_shift)
        log_audit(db, worker.id, "SAFE_EXIT_CONFIRMED", f"Shift ID: {active_shift.id}, Duration: {active_shift.total_hours}h")
        return {
            "message": "Safe exit confirmed. Shift ended.",
            "shift_id": active_shift.id,
            "total_hours": float(active_shift.total_hours)
        }
    else:
        log_audit(db, worker.id, "SAFE_EXIT_CONFIRMED", "No active shift — exit-only confirmation")
        return {
            "message": "Safe exit confirmed. No active shift was found.",
            "shift_id": None,
            "total_hours": 0
        }


@router.get("/attendance-summary")
def get_attendance_summary(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get today's attendance summary (admin only)"""
    today = date.today()
    today_start = datetime.combine(today, time.min)
    today_end = datetime.combine(today, time.max)

    workers = db.query(User).filter(User.role == "worker", User.is_active == True).all()

    total_workers = len(workers)
    checked_in = 0
    checked_out = 0
    still_in_mine = 0
    absent = 0

    worker_details = []
    for worker in workers:
        today_shifts = db.query(Shift).filter(
            Shift.worker_id == worker.id,
            Shift.start_time >= today_start,
            Shift.start_time <= today_end
        ).all()

        if today_shifts:
            checked_in += 1
            active = any(s.end_time is None for s in today_shifts)
            if active:
                still_in_mine += 1
                status_str = "in_mine"
            else:
                checked_out += 1
                status_str = "checked_out"
        else:
            absent += 1
            status_str = "absent"

        worker_details.append({
            "worker_id": worker.id,
            "name": worker.profile.full_name if worker.profile else worker.username,
            "department": worker.profile.department if worker.profile else "N/A",
            "status": status_str,
            "shifts_today": len(today_shifts)
        })

    return {
        "date": today.isoformat(),
        "total_workers": total_workers,
        "checked_in": checked_in,
        "checked_out": checked_out,
        "still_in_mine": still_in_mine,
        "absent": absent,
        "attendance_rate": round((checked_in / total_workers * 100) if total_workers > 0 else 0, 1),
        "workers": worker_details
    }


# --- Real-Time Shift Monitoring & Cumulative Hours ---

@router.get("/monitoring")
def get_shift_monitoring_status(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Get real-time shift monitoring timers, break time, remaining shift, overtime, and cumulative hours."""
    today = date.today()
    active_shift = db.query(Shift).filter(
        Shift.worker_id == worker.id,
        Shift.end_time == None
    ).first()

    now = datetime.now()
    is_clocked_in = active_shift is not None

    if is_clocked_in:
        elapsed = int((now - active_shift.start_time).total_seconds())
        start_iso = active_shift.start_time.isoformat()
    else:
        elapsed = 0
        start_iso = None

    shift_limit = 8 * 3600  # 8 hours standard
    remaining = max(0, shift_limit - elapsed)
    overtime = max(0, elapsed - shift_limit)
    progress_pct = min(100.0, round((elapsed / shift_limit) * 100, 1))

    # Calculate cumulative hours (daily, weekly, monthly)
    from datetime import timedelta
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)

    all_shifts = db.query(Shift).filter(Shift.worker_id == worker.id).all()

    daily_hrs = sum(float(s.total_hours or 0) for s in all_shifts if s.start_time.date() == today)
    if is_clocked_in:
        daily_hrs += round(elapsed / 3600.0, 2)

    weekly_hrs = sum(float(s.total_hours or 0) for s in all_shifts if s.start_time.date() >= week_start)
    if is_clocked_in:
        weekly_hrs += round(elapsed / 3600.0, 2)

    monthly_hrs = sum(float(s.total_hours or 0) for s in all_shifts if s.start_time.date() >= month_start)
    if is_clocked_in:
        monthly_hrs += round(elapsed / 3600.0, 2)

    # Notifications & Alerts logic
    alerts = []
    if elapsed > 10 * 3600:
        alerts.append("🔴 CRITICAL: Exceeded safe working hours (10+ hrs)! Mandatory shift end required.")
    elif elapsed > 8 * 3600:
        alerts.append("🟠 OVERTIME: Shift limit of 8 hours exceeded. Overtime tracking activated.")
    elif elapsed > 7.5 * 3600:
        alerts.append("🟡 SHIFT ENDING SOON: 30 minutes remaining in standard shift.")
    elif elapsed > 4 * 3600:
        alerts.append("☕ BREAK REMINDER: You have worked 4+ hours. Take a mandatory rest break.")

    return {
        "is_clocked_in": is_clocked_in,
        "shift_start_time": start_iso,
        "current_time": now.isoformat(),
        "seconds_elapsed": elapsed,
        "break_seconds": 15 * 60,  # 15 mins default recorded break
        "remaining_seconds": remaining,
        "overtime_seconds": overtime,
        "progress_percent": progress_pct,
        "daily_hours": round(daily_hrs, 2),
        "weekly_hours": round(weekly_hrs, 2),
        "monthly_hours": round(monthly_hrs, 2),
        "alerts": alerts
    }


@router.get("/supervisor-summary")
def get_supervisor_shift_summary(
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    """Returns worker shift summaries for supervisors and admins."""
    today = date.today()
    workers = db.query(User).filter(User.role == "worker").all()

    summaries = []
    for w in workers:
        active_shift = db.query(Shift).filter(
            Shift.worker_id == w.id,
            Shift.end_time == None
        ).first()

        completed_today = db.query(Shift).filter(
            Shift.worker_id == w.id,
            Shift.start_time >= datetime.combine(today, time.min)
        ).all()

        today_hours = sum(float(s.total_hours or 0) for s in completed_today)

        summaries.append({
            "worker_id": w.id,
            "username": w.username,
            "full_name": w.profile.full_name if w.profile else w.username,
            "department": w.profile.department if w.profile else "General Mine",
            "is_on_shift": active_shift is not None,
            "shift_start": active_shift.start_time.isoformat() if active_shift else None,
            "today_total_hours": round(today_hours, 2),
            "status": "Active On Duty" if active_shift else "Off Duty"
        })

    return {
        "success": True,
        "count": len(summaries),
        "active_on_shift": sum(1 for s in summaries if s["is_on_shift"]),
        "workers": summaries
    }


