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

# --- Notification Schemas ---
class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str = "safety_alert"
    category: str = "Announcement"
    priority: str = "info"
    target_role: str = "all"
    user_id: Optional[int] = None

class NotificationOut(BaseModel):
    id: int
    user_id: int
    sender_id: Optional[int] = None
    title: str
    message: str
    type: str
    category: str
    priority: str
    is_read: bool
    created_at: datetime

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
    # AI Fields
    risk_level: Optional[str] = None
    precautions: Optional[str] = None
    required_ppe: Optional[str] = None
    immediate_actions: Optional[str] = None
    notify_who: Optional[str] = None
    ai_analysis: Optional[Any] = None

class HazardReportCreate(HazardReportBase):
    pass

class HazardReportUpdate(BaseModel):
    status: Optional[str] = None
    investigator_id: Optional[int] = None
    remarks: Optional[str] = None
    # AI Fields
    risk_level: Optional[str] = None
    precautions: Optional[str] = None
    required_ppe: Optional[str] = None
    immediate_actions: Optional[str] = None
    notify_who: Optional[str] = None
    ai_analysis: Optional[Any] = None

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
    user_id: Optional[int] = None
    title: str
    message: str
    type: str = "safety_alert"
    category: Optional[str] = "General"
    priority: Optional[str] = "info"
    target_role: Optional[str] = "all"

class NotificationOut(BaseModel):
    id: int
    user_id: int
    sender_id: Optional[int] = None
    title: str
    message: str
    type: str
    category: Optional[str] = "General"
    priority: Optional[str] = "info"
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

# --- Supervisor Schemas ---
class LeaveRequestCreate(BaseModel):
    worker_id: int
    reason: str
    start_date: date
    end_date: date

class LeaveRequestOut(BaseModel):
    id: int
    worker_id: int
    reason: str
    start_date: date
    end_date: date
    status: str
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AnnouncementCreate(BaseModel):
    title: str
    message: str
    priority: str = "info"

class AnnouncementOut(AnnouncementCreate):
    id: int
    created_by: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class EquipmentStatusCreate(BaseModel):
    name: str
    category: str
    status: str = "operational"
    zone: str
    last_checked_at: Optional[datetime] = None

class EquipmentStatusOut(EquipmentStatusCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ShiftAssignmentCreate(BaseModel):
    worker_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    attendance_status: str = "present"

# --- AI Assistant Schemas ---
class AIQuestion(BaseModel):
    question: str
    language: Optional[str] = "en"

class AIAnswer(BaseModel):
    question: str
    answer: str
    category: str
    related_questions: List[str] = []

# --- System Setting & Admin Schemas ---
class SystemSettingBase(BaseModel):
    setting_key: str
    setting_value: str
    description: Optional[str] = None

class SystemSettingCreate(SystemSettingBase):
    pass

class SystemSettingOut(SystemSettingBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

class UserAdminCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "worker"
    is_active: bool = True
    full_name: Optional[str] = None
    department: Optional[str] = None
    mine_location: Optional[str] = None
    phone_number: Optional[str] = None
    employee_id: Optional[str] = None
    designation: Optional[str] = None
    blood_group: Optional[str] = "O+"
    age: Optional[int] = 30
    gender: Optional[str] = "Male"
    emergency_contact_name: Optional[str] = "N/A"
    emergency_contact_number: Optional[str] = "0000000000"
    address: Optional[str] = "Mining Zone 1"

class UserAdminUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    full_name: Optional[str] = None
    department: Optional[str] = None
    mine_location: Optional[str] = None
    phone_number: Optional[str] = None
    designation: Optional[str] = None
    blood_group: Optional[str] = None
    medical_conditions: Optional[str] = None
    safety_score: Optional[float] = None

