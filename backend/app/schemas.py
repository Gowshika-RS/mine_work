from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime, date
from decimal import Decimal

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "worker"

class UserCreate(UserBase):
    password: str
    shift_start_time: Optional[str] = "08:00"
    shift_end_time: Optional[str] = "16:00"

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class PasswordReset(BaseModel):
    email: EmailStr
    new_password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

# --- Worker Profile Schemas ---
class WorkerProfileBase(BaseModel):
    employee_id: str
    full_name: str
    age: int
    gender: str
    phone_number: str
    emergency_contact_name: str
    emergency_contact_number: str
    address: str
    blood_group: str
    medical_conditions: Optional[str] = None
    department: str
    mine_location: str
    designation: str
    joining_date: date

class WorkerProfileCreate(WorkerProfileBase):
    pass

class WorkerProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_number: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    medical_conditions: Optional[str] = None
    department: Optional[str] = None
    mine_location: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[date] = None

class WorkerProfileOut(WorkerProfileBase):
    id: int
    user_id: int
    safety_score: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    profile: Optional[WorkerProfileOut] = None

    class Config:
        from_attributes = True

# --- Shift Schemas ---
class ShiftBase(BaseModel):
    start_time: datetime
    end_time: Optional[datetime] = None
    total_hours: Optional[float] = None
    attendance_status: str = "present"

class ShiftCreate(BaseModel):
    start_time: datetime
    end_time: Optional[datetime] = None
    total_hours: Optional[float] = None
    attendance_status: str = "present"

class ShiftOut(ShiftBase):
    id: int
    worker_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ShiftEnd(BaseModel):
    end_time: datetime

class ShiftOut(BaseModel):
    id: int
    worker_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    total_hours: Optional[Decimal] = None
    attendance_status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Location Schemas ---
class LocationBase(BaseModel):
    latitude: Decimal
    longitude: Decimal

class LocationCreate(LocationBase):
    pass

class LocationOut(LocationBase):
    id: int
    worker_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Precaution Checklist Schemas ---
class PrecautionChecklistBase(BaseModel):
    helmet_worn: bool
    safety_boots_worn: bool
    gas_detector_checked: bool
    emergency_light_working: bool
    communication_device_working: bool

class PrecautionChecklistCreate(PrecautionChecklistBase):
    shift_id: Optional[int] = None

class PrecautionChecklistOut(PrecautionChecklistBase):
    id: int
    worker_id: int
    shift_id: Optional[int] = None
    submitted_at: datetime

    class Config:
        from_attributes = True

# --- Hazard Image Schemas ---
class HazardImageOut(BaseModel):
    id: int
    image_url: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Hazard Report Schemas ---
class HazardReportBase(BaseModel):
    hazard_type: str
    severity: str
    description: str
    location: str

class HazardReportCreate(HazardReportBase):
    pass

class HazardReportUpdate(BaseModel):
    status: Optional[str] = None
    investigator_id: Optional[int] = None
    remarks: Optional[str] = None

class HazardReportOut(HazardReportBase):
    id: int
    reporter_id: Optional[int] = None
    status: str
    investigator_id: Optional[int] = None
    remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    images: List[HazardImageOut] = []

    class Config:
        from_attributes = True

# --- Safety Score Schemas ---
class SafetyScoreBase(BaseModel):
    score: Decimal
    reason: str

class SafetyScoreCreate(SafetyScoreBase):
    worker_id: int

class SafetyScoreOut(SafetyScoreBase):
    id: int
    worker_id: int
    adjusted_by: Optional[int] = None
    timestamp: datetime

    class Config:
        from_attributes = True

# --- SOS Alert Schemas ---
class SOSAlertBase(BaseModel):
    latitude: Decimal
    longitude: Decimal
    alert_type: str = "SOS_TRIGGERED"

class SOSAlertCreate(SOSAlertBase):
    pass

class SOSAlertUpdate(BaseModel):
    status: str
    resolved_by: Optional[int] = None
    resolved_at: Optional[datetime] = None

class SOSAlertOut(SOSAlertBase):
    id: int
    worker_id: int
    status: str
    timestamp: datetime
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[int] = None

    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    type: str = "safety_alert"

class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Mine Zone Schemas ---
class MineZoneBase(BaseModel):
    name: str
    zone_type: str
    geometry_type: str = "circle"
    coordinates: Any  # Can be dict for circle, list of dicts for polygon

class MineZoneCreate(MineZoneBase):
    pass

class MineZoneOut(MineZoneBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Report Metadata Schemas ---
class ReportOut(BaseModel):
    id: int
    title: str
    type: str
    file_path: str
    created_by: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Audit Log Schemas ---
class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    ip_address: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Training Module Schemas ---
class TrainingModuleCreate(BaseModel):
    title: str
    category: str = "general"  # safety_guidelines, emergency_procedures, first_aid, general
    description: str
    content: str
    video_url: Optional[str] = None
    duration_minutes: int = 10
    is_mandatory: bool = False

class TrainingModuleOut(BaseModel):
    id: int
    title: str
    category: str
    description: str
    content: str
    video_url: Optional[str] = None
    duration_minutes: int
    is_mandatory: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TrainingQuizCreate(BaseModel):
    module_id: int
    question: str
    options: List[str]
    correct_answer: int  # Index of correct option

class TrainingQuizOut(BaseModel):
    id: int
    module_id: int
    question: str
    options: List[str]
    correct_answer: int
    created_at: datetime

    class Config:
        from_attributes = True

class QuizSubmission(BaseModel):
    answers: List[int]  # List of selected option indices

class TrainingProgressOut(BaseModel):
    id: int
    worker_id: int
    module_id: int
    completed: bool
    quiz_score: Optional[int] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Message Schemas ---
class MessageCreate(BaseModel):
    receiver_id: Optional[int] = None
    group_target: Optional[str] = None  # 'all', 'workers', 'admins'
    message_type: str = "direct"  # 'direct', 'announcement', 'emergency'
    content: str

class MessageOut(BaseModel):
    id: int
    sender_id: Optional[int] = None
    receiver_id: Optional[int] = None
    group_target: Optional[str] = None
    message_type: str
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Health Assessment Schemas ---
class HealthAssessmentCreate(BaseModel):
    fatigue_level: int = Field(..., ge=1, le=10)
    dizziness: bool = False
    breathing_difficulty: bool = False
    injuries: Optional[str] = None
    pain_level: int = Field(default=0, ge=0, le=10)
    hydration_status: str = "adequate"  # 'adequate', 'low', 'dehydrated'

class HealthAssessmentOut(BaseModel):
    id: int
    worker_id: int
    fatigue_level: int
    dizziness: bool
    breathing_difficulty: bool
    injuries: Optional[str] = None
    pain_level: int
    hydration_status: str
    recommendation: Optional[str] = None
    severity: str
    submitted_at: datetime

    class Config:
        from_attributes = True

# --- AI Assistant Schemas ---
class AIQuestion(BaseModel):
    question: str

class AIAnswer(BaseModel):
    question: str
    answer: str
    category: str
    related_questions: List[str] = []
