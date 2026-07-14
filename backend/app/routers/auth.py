from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta, datetime, date, time
from jose import jwt
from ..database import get_db
from ..models import User, WorkerProfile, SafetyScore, Shift
from ..schemas import UserCreate, UserLogin, Token, PasswordReset, UserOut
from ..auth.security import (
    get_password_hash, verify_password, create_access_token, 
    create_refresh_token, decode_token
)
from ..config import settings
from ..utils.audit_logging import log_audit

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.username == user_in.username) | (User.email == user_in.email)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
        
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_pwd,
        role=user_in.role,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # If the user is a worker, automatically create an empty profile and shift for them
    if new_user.role == "worker":
        # Generate some dummy unique employee ID
        emp_id = f"EMP-{new_user.id:04d}"
        profile = WorkerProfile(
            user_id=new_user.id,
            employee_id=emp_id,
            full_name=new_user.username.capitalize(),
            age=30,
            gender="Not Specified",
            phone_number="N/A",
            emergency_contact_name="N/A",
            emergency_contact_number="N/A",
            address="N/A",
            blood_group="O+",
            medical_conditions="",
            department="Operations",
            mine_location="Shaft 1",
            designation="Miner",
            joining_date=date.today(),
            safety_score=100.00
        )
        db.add(profile)
        
        # Parse shift times and create a shift record
        try:
            # Parse shift times (format: "HH:MM")
            start_time_str = user_in.shift_start_time or "08:00"
            end_time_str = user_in.shift_end_time or "16:00"
            
            start_parts = start_time_str.split(':')
            end_parts = end_time_str.split(':')
            
            # Create datetime objects for today
            today = date.today()
            start_datetime = datetime.combine(today, time(int(start_parts[0]), int(start_parts[1])))
            end_datetime = datetime.combine(today, time(int(end_parts[0]), int(end_parts[1])))
            
            # Calculate total hours
            duration = end_datetime - start_datetime
            total_hours = duration.total_seconds() / 3600
            
            # Create shift record
            shift = Shift(
                worker_id=new_user.id,
                start_time=start_datetime,
                end_time=end_datetime,
                total_hours=round(total_hours, 2),
                attendance_status="present"
            )
            db.add(shift)
        except (ValueError, IndexError):
            # If shift time parsing fails, just skip shift creation
            pass
        
        # Add initial safety score log
        initial_score = SafetyScore(
            worker_id=new_user.id,
            score=100.00,
            reason="Initial Safety Score assignment upon registration"
        )
        db.add(initial_score)
        db.commit()
        db.refresh(new_user)
        
    log_audit(db, new_user.id, "USER_REGISTERED", f"Username: {new_user.username}")
    return new_user

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_in.username).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is disabled"
        )
        
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    refresh_token = create_refresh_token(data={"sub": user.username, "role": user.role})
    
    log_audit(db, user.id, "USER_LOGIN", "User logged in successfully")
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "role": user.role,
        "username": user.username
    }

@router.post("/refresh", response_model=Token)
def refresh_tokens(refresh_token: str, db: Session = Depends(get_db)):
    try:
        payload = decode_token(refresh_token)
        username = payload.get("sub")
        token_type = payload.get("type")
        if username is None or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"}
            )
            
        user = db.query(User).filter(User.username == username).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
                headers={"WWW-Authenticate": "Bearer"}
            )
            
        access_token = create_access_token(data={"sub": user.username, "role": user.role})
        new_refresh = create_refresh_token(data={"sub": user.username, "role": user.role})
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh,
            "role": user.role,
            "username": user.username
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )

@router.post("/reset-password")
def reset_password(req: PasswordReset, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email address not found"
        )
        
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    
    log_audit(db, user.id, "PASSWORD_RESET", "Password was reset via endpoint")
    return {"message": "Password updated successfully"}
