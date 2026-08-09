from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from typing import List
from ..database import get_db
from ..models import UserGamification, UserBadge, User
from ..schemas import UserGamificationOut, UserBadgeOut
from ..auth.security import require_worker, require_any_role

router = APIRouter(prefix="/gamification", tags=["Gamification & Streaks"])

ALL_BADGES = [
    {"key": "streak_1", "name": "1 Day Streak", "icon": "🔥", "description": "Completed your first daily check-in!"},
    {"key": "streak_7", "name": "7 Day Streak", "icon": "⚡", "description": "Achieved a 7-day active safety streak!"},
    {"key": "streak_30", "name": "30 Day Streak", "icon": "🏆", "description": "Maintained 30 days of consecutive mining check-ins!"},
    {"key": "streak_100", "name": "100 Day Streak", "icon": "👑", "description": "Master of Safety! 100 days of perfection!"},
    {"key": "safety_champ", "name": "Safety Champion", "icon": "🛡️", "description": "Demonstrated top safety scores and checklist compliance."},
    {"key": "ppe_master", "name": "PPE Master", "icon": "🪖", "description": "100% PPE compliance verified across shift checklists."},
    {"key": "perfect_att", "name": "Perfect Attendance", "icon": "⭐", "description": "Zero unexcused absences recorded!"},
    {"key": "hazard_reporter", "name": "Hazard Reporter", "icon": "🚨", "description": "Reported and flagged dangerous mining conditions."},
    {"key": "emergency_hero", "name": "Emergency Hero", "icon": "🚑", "description": "Helped resolve an SOS emergency distress situation."}
]

@router.get("/profile")
def get_gamification_profile(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    gamification = db.query(UserGamification).filter(UserGamification.worker_id == worker.id).first()
    if not gamification:
        gamification = UserGamification(
            worker_id=worker.id,
            current_streak=1,
            longest_streak=1,
            xp=100,
            level=1,
            last_checkin_date=date.today()
        )
        db.add(gamification)
        
        # Give 1 Day Streak badge by default
        badge1 = UserBadge(
            worker_id=worker.id,
            badge_key="streak_1",
            badge_name="1 Day Streak",
            description="Completed your first daily check-in!",
            icon="🔥"
        )
        db.add(badge1)
        db.commit()
        db.refresh(gamification)

    unlocked_badges = db.query(UserBadge).filter(UserBadge.worker_id == worker.id).all()
    unlocked_keys = {b.badge_key for b in unlocked_badges}

    badge_collection = []
    for b in ALL_BADGES:
        is_unlocked = b["key"] in unlocked_keys
        unlocked_obj = next((u for u in unlocked_badges if u.badge_key == b["key"]), None)
        badge_collection.append({
            "badge_key": b["key"],
            "badge_name": b["name"],
            "icon": b["icon"],
            "description": b["description"],
            "is_unlocked": is_unlocked,
            "unlocked_at": unlocked_obj.unlocked_at.strftime("%Y-%m-%d %H:%M") if unlocked_obj else None
        })

    # Calculate XP to next level (200 XP per level)
    current_level_xp = (gamification.level - 1) * 200
    xp_in_level = gamification.xp - current_level_xp
    xp_for_next_level = 200
    progress_percentage = min(100.0, round((xp_in_level / xp_for_next_level) * 100, 1))

    return {
        "worker_id": worker.id,
        "current_streak": gamification.current_streak,
        "longest_streak": gamification.longest_streak,
        "xp": gamification.xp,
        "level": gamification.level,
        "xp_in_level": xp_in_level,
        "xp_for_next_level": xp_for_next_level,
        "progress_percentage": progress_percentage,
        "last_checkin_date": str(gamification.last_checkin_date) if gamification.last_checkin_date else None,
        "badges": badge_collection
    }
