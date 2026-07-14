from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User, WorkerProfile, SafetyScore
from ..schemas import WorkerProfileOut, WorkerProfileUpdate, WorkerProfileCreate, UserOut
from ..auth.security import get_current_active_user, require_admin, require_any_role, get_password_hash
from ..utils.audit_logging import log_audit
from datetime import date

router = APIRouter(prefix="/workers", tags=["Workers"])

class CreateWorkerPayload(WorkerProfileCreate):
    username: str
    email: str
    password: str

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_worker(
    payload: CreateWorkerPayload,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    # Check if username or email exists
    existing = db.query(User).filter(
        (User.username == payload.username) | (User.email == payload.email)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists"
        )
        
    # Check if employee_id already exists
    existing_emp = db.query(WorkerProfile).filter(WorkerProfile.employee_id == payload.employee_id).first()
    if existing_emp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee ID already registered"
        )

    # Create User
    new_user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role="worker",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create Profile
    profile = WorkerProfile(
        user_id=new_user.id,
        employee_id=payload.employee_id,
        full_name=payload.full_name,
        age=payload.age,
        gender=payload.gender,
        phone_number=payload.phone_number,
        emergency_contact_name=payload.emergency_contact_name,
        emergency_contact_number=payload.emergency_contact_number,
        address=payload.address,
        blood_group=payload.blood_group,
        medical_conditions=payload.medical_conditions,
        department=payload.department,
        mine_location=payload.mine_location,
        designation=payload.designation,
        joining_date=payload.joining_date,
        safety_score=100.00
    )
    db.add(profile)
    
    # Add initial safety score
    score_log = SafetyScore(
        worker_id=new_user.id,
        score=100.00,
        adjusted_by=admin.id,
        reason="Initial profile setup by admin"
    )
    db.add(score_log)
    
    db.commit()
    db.refresh(new_user)
    
    log_audit(db, admin.id, "WORKER_CREATED", f"Created worker: {new_user.username} (ID: {new_user.id})")
    return new_user

@router.get("/profiles", response_model=List[WorkerProfileOut])
def list_worker_profiles(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    profiles = db.query(WorkerProfile).all()
    return profiles

@router.get("/{worker_id}/profile", response_model=WorkerProfileOut)
def get_worker_profile(
    worker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role)
):
    # Enforce RBAC: Workers can only view their own profile, Admins can view any
    if current_user.role == "worker" and current_user.id != worker_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own profile"
        )
        
    profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == worker_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker profile not found"
        )
    return profile

@router.put("/{worker_id}/profile", response_model=WorkerProfileOut)
def update_worker_profile(
    worker_id: int,
    profile_in: WorkerProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role)
):
    # Enforce RBAC
    if current_user.role == "worker" and current_user.id != worker_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile"
        )
        
    profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == worker_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker profile not found"
        )
        
    # Update fields
    for field, value in profile_in.dict(exclude_unset=True).items():
        setattr(profile, field, value)
        
    db.commit()
    db.refresh(profile)
    
    log_audit(db, current_user.id, "WORKER_PROFILE_UPDATED", f"Updated profile for worker ID: {worker_id}")
    return profile
