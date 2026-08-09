import os
import uuid
import base64
from datetime import datetime, date, time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Attendance, User, UserGamification, UserBadge, Notification
from ..schemas import AttendanceOut, AttendanceCheckIn
from ..auth.security import require_worker, require_any_role, require_supervisor_or_admin
from ..websocket import manager
from ..utils.audit_logging import log_audit
from ..utils.face_verifier import verify_selfie_against_user_profile

router = APIRouter(prefix="/attendance", tags=["Attendance Module"])

def update_worker_gamification(db: Session, worker_id: int):
    today = date.today()
    gamification = db.query(UserGamification).filter(UserGamification.worker_id == worker_id).first()
    if not gamification:
        gamification = UserGamification(
            worker_id=worker_id,
            current_streak=1,
            longest_streak=1,
            xp=50,
            level=1,
            last_checkin_date=today
        )
        db.add(gamification)
        db.commit()
        db.refresh(gamification)
    else:
        if gamification.last_checkin_date != today:
            # Check if consecutive day
            if gamification.last_checkin_date and (today - gamification.last_checkin_date).days == 1:
                gamification.current_streak += 1
            else:
                gamification.current_streak = 1
                
            if gamification.current_streak > gamification.longest_streak:
                gamification.longest_streak = gamification.current_streak
                
            gamification.xp += 50
            gamification.level = (gamification.xp // 200) + 1
            gamification.last_checkin_date = today
            db.commit()
            db.refresh(gamification)

    # Check for unlocked badges
    newly_unlocked = []
    badge_rules = [
        {"key": "streak_1", "name": "1 Day Streak", "icon": "🔥", "condition": gamification.current_streak >= 1, "desc": "Completed first check-in!"},
        {"key": "streak_7", "name": "7 Day Streak", "icon": "⚡", "condition": gamification.current_streak >= 7, "desc": "Checked in for 7 consecutive days!"},
        {"key": "streak_30", "name": "30 Day Streak", "icon": "🏆", "condition": gamification.current_streak >= 30, "desc": "30-day safety streak master!"},
        {"key": "streak_100", "name": "100 Day Streak", "icon": "👑", "condition": gamification.current_streak >= 100, "desc": "100-day safety legend!"},
        {"key": "perfect_att", "name": "Perfect Attendance", "icon": "⭐", "condition": gamification.xp >= 300, "desc": "Consistent mine attendance champion!"},
        {"key": "safety_champ", "name": "Safety Champion", "icon": "🛡️", "condition": gamification.level >= 3, "desc": "Reached Safety Companion Level 3!"}
    ]

    for rule in badge_rules:
        if rule["condition"]:
            existing_badge = db.query(UserBadge).filter(
                UserBadge.worker_id == worker_id,
                UserBadge.badge_key == rule["key"]
            ).first()
            if not existing_badge:
                new_badge = UserBadge(
                    worker_id=worker_id,
                    badge_key=rule["key"],
                    badge_name=rule["name"],
                    description=rule["desc"],
                    icon=rule["icon"]
                )
                db.add(new_badge)
                newly_unlocked.append({"key": rule["key"], "name": rule["name"], "icon": rule["icon"]})
    
    if newly_unlocked:
        db.commit()
        
    return gamification, newly_unlocked


@router.post("/check-in")
async def check_in(
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    file: Optional[UploadFile] = File(None),
    photo_base64: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    today = date.today()
    existing = db.query(Attendance).filter(
        Attendance.worker_id == worker.id,
        Attendance.date == today
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You have already checked in for today. Multiple check-ins are not allowed."
        )

    # Process selfie image raw bytes
    photo_url = "/static/attendance/default_selfie.jpg"
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    upload_dir = os.path.join(base_dir, "uploads", "attendance")
    os.makedirs(upload_dir, exist_ok=True)
    
    img_bytes = None
    if file:
        contents = await file.read()
        img_bytes = contents
        filename = f"{uuid.uuid4()}_{file.filename}"
        filepath = os.path.join(upload_dir, filename)
        with open(filepath, "wb") as f:
            f.write(contents)
        photo_url = f"/static/attendance/{filename}"
    elif photo_base64:
        try:
            if "," in photo_base64:
                header, encoded = photo_base64.split(",", 1)
            else:
                encoded = photo_base64
            img_bytes = base64.b64decode(encoded)
            filename = f"{uuid.uuid4()}_selfie.jpg"
            filepath = os.path.join(upload_dir, filename)
            with open(filepath, "wb") as f:
                f.write(img_bytes)
            photo_url = f"/static/attendance/{filename}"
        except Exception as e:
            print("Failed to decode base64 photo:", e)

    if not img_bytes:
        raise HTTPException(
            status_code=400,
            detail="Camera selfie image is required for attendance check-in."
        )

    # Run OpenCV Face Verification & User Identity Protection
    is_verified, score, v_msg = verify_selfie_against_user_profile(
        selfie_bytes=img_bytes,
        worker_user_id=worker.id,
        db=db,
        base_dir=base_dir
    )

    if not is_verified:
        log_audit(db, worker.id, "ATTENDANCE_FAILED", f"Face verification failed: {v_msg}")
        raise HTTPException(
            status_code=400,
            detail=v_msg
        )

    # If worker does not have a registered reference face yet, auto-register this selfie as baseline face!
    if worker.profile and not worker.profile.face_photo_url:
        worker.profile.face_photo_url = photo_url
        db.commit()

    now = datetime.utcnow()
    # Check if late (e.g. after 09:00 AM)
    is_late = now.time() > time(9, 0, 0)
    attendance_status = "late" if is_late else "present"

    attendance = Attendance(
        worker_id=worker.id,
        date=today,
        check_in_time=now,
        latitude=latitude or 12.9716,
        longitude=longitude or 77.5946,
        photo_url=photo_url,
        status=attendance_status,
        face_verified=True,
        confidence_score=score
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    # Update streaks, XP, badges
    gamification, newly_unlocked = update_worker_gamification(db, worker.id)

    worker_name = worker.profile.full_name if worker.profile else worker.username

    # Broadcast notification to supervisor and admin
    ws_event = {
        "type": "attendance_update",
        "worker_id": worker.id,
        "worker_name": worker_name,
        "status": attendance_status,
        "check_in_time": now.strftime("%Y-%m-%d %H:%M:%S"),
        "photo_url": photo_url
    }
    await manager.broadcast_to_role(ws_event, "supervisor")
    await manager.broadcast_to_role(ws_event, "admin")

    log_audit(db, worker.id, "ATTENDANCE_CHECK_IN", f"Checked in with status {attendance_status}")

    return {
        "message": f"Check-in successful! Face identity verified ({score:.1f}% match).",
        "attendance": {
            "id": attendance.id,
            "date": str(attendance.date),
            "check_in_time": attendance.check_in_time.strftime("%H:%M:%S"),
            "status": attendance.status,
            "photo_url": photo_url,
            "face_verified": True,
            "confidence_score": score
        },
        "gamification": {
            "current_streak": gamification.current_streak,
            "longest_streak": gamification.longest_streak,
            "xp": gamification.xp,
            "level": gamification.level,
            "new_badges": newly_unlocked
        }
    }


@router.post("/register-face")
async def register_face_reference(
    file: Optional[UploadFile] = File(None),
    photo_base64: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """
    Allows a worker to upload/update their baseline reference face photo for face identity verification.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    upload_dir = os.path.join(base_dir, "uploads", "face_profiles")
    os.makedirs(upload_dir, exist_ok=True)

    img_bytes = None
    if file:
        contents = await file.read()
        img_bytes = contents
        filename = f"user_{worker.id}_{uuid.uuid4().hex[:8]}.jpg"
        filepath = os.path.join(upload_dir, filename)
        with open(filepath, "wb") as f:
            f.write(contents)
        photo_url = f"/static/face_profiles/{filename}"
    elif photo_base64:
        try:
            if "," in photo_base64:
                header, encoded = photo_base64.split(",", 1)
            else:
                encoded = photo_base64
            img_bytes = base64.b64decode(encoded)
            filename = f"user_{worker.id}_{uuid.uuid4().hex[:8]}.jpg"
            filepath = os.path.join(upload_dir, filename)
            with open(filepath, "wb") as f:
                f.write(img_bytes)
            photo_url = f"/static/face_profiles/{filename}"
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid photo encoding.")

    if not img_bytes:
        raise HTTPException(status_code=400, detail="Photo file or base64 image data is required.")

    # Verify a face is visible in the reference image using OpenCV
    from ..utils.face_verifier import extract_face_region, cv2, np
    np_arr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    face_crop = extract_face_region(img)

    if face_crop is None:
        raise HTTPException(
            status_code=400,
            detail="No human face detected in photo! Please upload a clear headshot photo."
        )

    if not worker.profile:
        raise HTTPException(status_code=400, detail="Worker profile missing.")

    worker.profile.face_photo_url = photo_url
    db.commit()
    db.refresh(worker.profile)

    log_audit(db, worker.id, "FACE_REGISTERED", f"Registered reference face profile photo")

    return {
        "message": "Reference face profile photo registered successfully!",
        "face_photo_url": photo_url
    }


@router.post("/check-out")
async def check_out(
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    today = date.today()
    attendance = db.query(Attendance).filter(
        Attendance.worker_id == worker.id,
        Attendance.date == today
    ).first()

    if not attendance:
        raise HTTPException(
            status_code=400,
            detail="No check-in record found for today. Please check in first."
        )

    if attendance.check_out_time:
        raise HTTPException(
            status_code=400,
            detail="You have already checked out for today."
        )

    now = datetime.utcnow()
    attendance.check_out_time = now
    db.commit()
    db.refresh(attendance)

    log_audit(db, worker.id, "ATTENDANCE_CHECK_OUT", "Checked out successfully")

    return {
        "message": "Check-out successful!",
        "check_out_time": now.strftime("%H:%M:%S")
    }


@router.get("/today")
def get_today_attendance(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    today = date.today()
    att = db.query(Attendance).filter(
        Attendance.worker_id == worker.id,
        Attendance.date == today
    ).first()
    return att


@router.get("/history")
def get_attendance_history(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    records = db.query(Attendance).filter(
        Attendance.worker_id == worker.id
    ).order_by(Attendance.date.desc()).limit(30).all()
    return records


@router.get("/supervisor/summary")
def get_supervisor_attendance_summary(
    db: Session = Depends(get_db),
    user: User = Depends(require_supervisor_or_admin)
):
    today = date.today()
    all_workers = db.query(User).filter(User.role == "worker").all()
    total_workers = len(all_workers)

    today_records = db.query(Attendance).filter(Attendance.date == today).all()
    present_count = len([r for r in today_records if r.status in ("present", "late")])
    late_count = len([r for r in today_records if r.status == "late"])
    absent_count = max(0, total_workers - present_count)

    attendance_percentage = round((present_count / total_workers * 100), 1) if total_workers > 0 else 100.0

    records_data = []
    for r in today_records:
        w_profile = r.worker.profile if r.worker else None
        records_data.append({
            "id": r.id,
            "worker_id": r.worker_id,
            "worker_name": w_profile.full_name if w_profile else r.worker.username,
            "employee_id": w_profile.employee_id if w_profile else f"W-{r.worker_id}",
            "department": w_profile.department if w_profile else "General",
            "check_in_time": r.check_in_time.strftime("%H:%M:%S") if r.check_in_time else "N/A",
            "check_out_time": r.check_out_time.strftime("%H:%M:%S") if r.check_out_time else None,
            "status": r.status,
            "photo_url": r.photo_url,
            "face_verified": r.face_verified
        })

    return {
        "date": str(today),
        "total_workers": total_workers,
        "present_count": present_count,
        "late_count": late_count,
        "absent_count": absent_count,
        "attendance_percentage": attendance_percentage,
        "today_records": records_data
    }
