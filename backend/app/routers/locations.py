from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from math import radians, cos, sin, asin, sqrt
from decimal import Decimal
from ..database import get_db
from ..models import Location, User, MineZone, Notification, WorkerProfile
from ..schemas import LocationOut, LocationCreate, MineZoneOut
from ..auth.security import get_current_active_user, require_admin, require_worker, require_any_role
from ..websocket import manager
from ..utils.audit_logging import log_audit

router = APIRouter(prefix="/locations", tags=["Locations"])

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Haversine formula to calculate distance in meters
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371000  # Earth's radius in meters
    return c * r

@router.post("/", response_model=LocationOut)
async def update_location(
    loc_in: LocationCreate,
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    now = datetime.utcnow()
    new_loc = Location(
        worker_id=worker.id,
        latitude=loc_in.latitude,
        longitude=loc_in.longitude,
        timestamp=now
    )
    db.add(new_loc)
    
    # Check geofencing: Retrieve all mine zones
    zones = db.query(MineZone).all()
    breaches = []
    
    for zone in zones:
        coords = zone.coordinates
        if zone.geometry_type == "circle":
            center_lat = float(coords.get("latitude", 0))
            center_lng = float(coords.get("longitude", 0))
            radius = float(coords.get("radius", 0))
            
            dist = calculate_distance(
                float(loc_in.latitude), float(loc_in.longitude),
                center_lat, center_lng
            )
            
            if dist <= radius:
                if zone.zone_type in ["restricted", "high_risk"]:
                    breaches.append(zone)
                    
    # Process breaches
    for zone in breaches:
        # Create DB notification for safety logs
        notif_title = "Zone Entry Warning" if zone.zone_type == "high_risk" else "RESTRICTED AREA BREACH"
        notif_msg = f"You have entered a {zone.zone_type} zone: {zone.name}. Please evacuate immediately."
        
        notif = Notification(
            user_id=worker.id,
            title=notif_title,
            message=notif_msg,
            type="hazard_warning" if zone.zone_type == "high_risk" else "safety_alert"
        )
        db.add(notif)
        
        # Deduct a bit from safety score as penalty for entering restricted zone
        profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == worker.id).first()
        if profile and zone.zone_type == "restricted":
            profile.safety_score = max(Decimal("0.00"), profile.safety_score - Decimal("5.00"))
            log_audit(db, worker.id, "RESTRICTED_ZONE_BREACH_PENALTY", f"Deducted 5 safety points due to breach in zone: {zone.name}")

        # Send WebSocket notification to the worker
        await manager.send_personal_message({
            "type": "safety_alert",
            "title": notif_title,
            "message": notif_msg,
            "timestamp": now.strftime("%Y-%m-%d %H:%M:%S")
        }, worker.id)
        
        # Send WebSocket notification to admins
        admin_alert = {
            "type": "zone_breach",
            "worker_id": worker.id,
            "worker_name": worker.profile.full_name if worker.profile else worker.username,
            "zone_name": zone.name,
            "zone_type": zone.zone_type,
            "latitude": str(loc_in.latitude),
            "longitude": str(loc_in.longitude),
            "timestamp": now.strftime("%Y-%m-%d %H:%M:%S")
        }
        await manager.broadcast_to_role(admin_alert, "admin")

    db.commit()
    db.refresh(new_loc)
    
    # Broadcast new location update to all listening admins
    location_payload = {
        "type": "location_update",
        "worker_id": worker.id,
        "worker_name": worker.profile.full_name if worker.profile else worker.username,
        "department": worker.profile.department if worker.profile else "N/A",
        "latitude": str(loc_in.latitude),
        "longitude": str(loc_in.longitude),
        "timestamp": now.strftime("%Y-%m-%d %H:%M:%S")
    }
    await manager.broadcast_to_role(location_payload, "admin")
    
    return new_loc

@router.get("/live", response_model=List[LocationOut])
def get_live_locations(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    # Fetch the latest location record for each active worker
    latest_locations = db.execute("""
        SELECT l.* FROM locations l
        INNER JOIN (
            SELECT worker_id, MAX(timestamp) as max_t
            FROM locations
            GROUP BY worker_id
        ) latest ON l.worker_id = latest.worker_id AND l.timestamp = latest.max_t
    """).fetchall()
    
    # Map raw SQL rows to schema objects
    result = []
    for row in latest_locations:
        result.append(Location(
            id=row[0],
            worker_id=row[1],
            latitude=row[2],
            longitude=row[3],
            timestamp=row[4]
        ))
    return result

@router.get("/history/{worker_id}", response_model=List[LocationOut])
def get_location_history(
    worker_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    locations = db.query(Location).filter(Location.worker_id == worker_id).order_by(Location.timestamp.desc()).all()
    return locations


@router.get("/history", response_model=List[LocationOut])
def get_my_location_history(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Get the current worker's location history"""
    locations = db.query(Location).filter(Location.worker_id == worker.id).order_by(Location.timestamp.desc()).all()
    return locations


@router.get("/current", response_model=LocationOut)
def get_current_location(
    db: Session = Depends(get_db),
    worker: User = Depends(require_worker)
):
    """Get the worker's current (latest) location"""
    location = db.query(Location).filter(Location.worker_id == worker.id).order_by(Location.timestamp.desc()).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No location data available"
        )
    return location


@router.get("/zones", response_model=List[MineZoneOut])
def get_mine_zones(
    db: Session = Depends(get_db),
    user: User = Depends(require_any_role)
):
    """Retrieve all defined mine zones"""
    return db.query(MineZone).all()
