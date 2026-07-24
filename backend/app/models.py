from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric, Text, JSON, Date, func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="worker", nullable=False)  # 'admin', 'worker'
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    profile = relationship("WorkerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    shifts = relationship("Shift", back_populates="worker", cascade="all, delete-orphan")
    locations = relationship("Location", back_populates="worker", cascade="all, delete-orphan")
    reported_hazards = relationship("HazardReport", foreign_keys="HazardReport.reporter_id", back_populates="reporter")
    investigated_hazards = relationship("HazardReport", foreign_keys="HazardReport.investigator_id", back_populates="investigator")
    safety_scores = relationship("SafetyScore", foreign_keys="SafetyScore.worker_id", back_populates="worker", cascade="all, delete-orphan")
    adjusted_scores = relationship("SafetyScore", foreign_keys="SafetyScore.adjusted_by", back_populates="adjuster")
    checklists = relationship("PrecautionChecklist", back_populates="worker", cascade="all, delete-orphan")
    sos_alerts = relationship("SOSAlert", foreign_keys="SOSAlert.worker_id", back_populates="worker", cascade="all, delete-orphan")
    resolved_sos_alerts = relationship("SOSAlert", foreign_keys="SOSAlert.resolved_by", back_populates="resolver")
    notifications = relationship("Notification", foreign_keys="Notification.user_id", back_populates="user", cascade="all, delete-orphan")
    sent_notifications = relationship("Notification", foreign_keys="Notification.sender_id", back_populates="sender")
    created_reports = relationship("Report", back_populates="creator")
    audit_logs = relationship("AuditLog", back_populates="user")
    training_progress = relationship("TrainingProgress", back_populates="worker", cascade="all, delete-orphan")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")
    health_assessments = relationship("HealthAssessment", back_populates="worker", cascade="all, delete-orphan")
    leave_requests = relationship("LeaveRequest", foreign_keys="LeaveRequest.worker_id", back_populates="worker", cascade="all, delete-orphan")
    reviewed_leaves = relationship("LeaveRequest", foreign_keys="LeaveRequest.reviewed_by", back_populates="reviewer")
    announcements = relationship("SupervisorAnnouncement", back_populates="author", cascade="all, delete-orphan")


class WorkerProfile(Base):
    __tablename__ = "worker_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    phone_number = Column(String(20), nullable=False)
    emergency_contact_name = Column(String(100), nullable=False)
    emergency_contact_number = Column(String(20), nullable=False)
    address = Column(Text, nullable=False)
    blood_group = Column(String(10), nullable=False)
    medical_conditions = Column(Text, nullable=True)
    department = Column(String(100), nullable=False)
    mine_location = Column(String(100), nullable=False)
    designation = Column(String(100), nullable=False)
    joining_date = Column(Date, nullable=False)
    safety_score = Column(Numeric(5, 2), default=100.00, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="profile")


class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    worker_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    total_hours = Column(Numeric(5, 2), nullable=True)
    attendance_status = Column(String(20), default="present", nullable=False)  # 'present', 'absent', 'late', 'completed'
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    worker = relationship("User", back_populates="shifts")
    checklist = relationship("PrecautionChecklist", back_populates="shift", uselist=False)


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    worker_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    timestamp = Column(DateTime, default=func.now(), index=True, nullable=False)

    # Relationships
    worker = relationship("User", back_populates="locations")


class HazardReport(Base):
    __tablename__ = "hazard_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    hazard_type = Column(String(100), nullable=False)
    severity = Column(String(20), default="medium", nullable=False)  # 'low', 'medium', 'high', 'critical'
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    status = Column(String(20), default="open", nullable=False)  # 'open', 'under_review', 'resolved'
    investigator_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    remarks = Column(Text, nullable=True)
    
    # AI Hazard Detection Fields
    risk_level = Column(String(50), nullable=True)
    precautions = Column(Text, nullable=True)
    required_ppe = Column(Text, nullable=True)
    immediate_actions = Column(Text, nullable=True)
    notify_who = Column(String(100), nullable=True)
    ai_analysis = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reported_hazards")
    investigator = relationship("User", foreign_keys=[investigator_id], back_populates="investigated_hazards")
    images = relationship("HazardImage", back_populates="hazard_report", cascade="all, delete-orphan")


class HazardImage(Base):
    __tablename__ = "hazard_images"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    hazard_report_id = Column(Integer, ForeignKey("hazard_reports.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    hazard_report = relationship("HazardReport", back_populates="images")


class SafetyScore(Base):
    __tablename__ = "safety_scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    worker_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    score = Column(Numeric(5, 2), nullable=False)
    adjusted_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reason = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    worker = relationship("User", foreign_keys=[worker_id], back_populates="safety_scores")
    adjuster = relationship("User", foreign_keys=[adjusted_by], back_populates="adjusted_scores")


class PrecautionChecklist(Base):
    __tablename__ = "precautions_checklist"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    worker_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    shift_id = Column(Integer, ForeignKey("shifts.id", ondelete="CASCADE"), nullable=True)
    helmet_worn = Column(Boolean, default=False, nullable=False)
    safety_boots_worn = Column(Boolean, default=False, nullable=False)
    gas_detector_checked = Column(Boolean, default=False, nullable=False)
    emergency_light_working = Column(Boolean, default=False, nullable=False)
    communication_device_working = Column(Boolean, default=False, nullable=False)
    submitted_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    worker = relationship("User", back_populates="checklists")
    shift = relationship("Shift", back_populates="checklist")


class SOSAlert(Base):
    __tablename__ = "sos_alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    worker_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    alert_type = Column(String(50), default="SOS_TRIGGERED", nullable=False)
    status = Column(String(20), default="active", nullable=False)  # 'active', 'acknowledged', 'dispatched', 'resolved'
    timestamp = Column(DateTime, default=func.now(), nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    worker = relationship("User", foreign_keys=[worker_id], back_populates="sos_alerts")
    resolver = relationship("User", foreign_keys=[resolved_by], back_populates="resolved_sos_alerts")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="safety_alert", nullable=False)  # 'safety_alert', 'hazard_warning', 'shift_reminder', 'emergency_instruction', 'sos_triggered', 'announcement'
    category = Column(String(50), default="General", nullable=False)
    priority = Column(String(20), default="info", nullable=False)  # 'info', 'warning', 'critical', 'emergency'
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="notifications")
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_notifications")


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    worker_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reason = Column(Text, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(20), default="pending", nullable=False)
    reviewed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    worker = relationship("User", foreign_keys=[worker_id], back_populates="leave_requests")
    reviewer = relationship("User", foreign_keys=[reviewed_by], back_populates="reviewed_leaves")


class SupervisorAnnouncement(Base):
    __tablename__ = "supervisor_announcements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(String(20), default="info", nullable=False)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    author = relationship("User", back_populates="announcements")


class EquipmentStatus(Base):
    __tablename__ = "equipment_status"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    status = Column(String(30), default="operational", nullable=False)
    zone = Column(String(100), nullable=False)
    last_checked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)


class MineZone(Base):
    __tablename__ = "mine_zones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    zone_type = Column(String(50), nullable=False)  # 'restricted', 'high_risk', 'safe', 'assembly', 'emergency_exit'
    geometry_type = Column(String(20), default="circle", nullable=False)  # 'circle', 'polygon'
    coordinates = Column(JSON, nullable=False)  # Center + Radius or Polygon Points list
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)  # 'daily', 'weekly', 'monthly', 'hazard', 'attendance', 'incident'
    file_path = Column(String(255), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    creator = relationship("User", back_populates="created_reports")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    ip_address = Column(String(45), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="audit_logs")


class TrainingModule(Base):
    __tablename__ = "training_modules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)  # 'safety_guidelines', 'emergency_procedures', 'first_aid', 'general'
    description = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    video_url = Column(String(500), nullable=True)
    duration_minutes = Column(Integer, default=10, nullable=False)
    is_mandatory = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    quizzes = relationship("TrainingQuiz", back_populates="module", cascade="all, delete-orphan")
    progress = relationship("TrainingProgress", back_populates="module", cascade="all, delete-orphan")


class TrainingQuiz(Base):
    __tablename__ = "training_quizzes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    module_id = Column(Integer, ForeignKey("training_modules.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # List of option strings
    correct_answer = Column(Integer, nullable=False)  # Index of correct option
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    module = relationship("TrainingModule", back_populates="quizzes")


class TrainingProgress(Base):
    __tablename__ = "training_progress"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    worker_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    module_id = Column(Integer, ForeignKey("training_modules.id", ondelete="CASCADE"), nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    quiz_score = Column(Integer, nullable=True)  # Percentage score
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    worker = relationship("User", back_populates="training_progress")
    module = relationship("TrainingModule", back_populates="progress")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    group_target = Column(String(50), nullable=True)  # 'all', 'workers', 'admins', None for direct
    message_type = Column(String(30), default="direct", nullable=False)  # 'direct', 'announcement', 'emergency'
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")


class HealthAssessment(Base):
    __tablename__ = "health_assessments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    worker_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    fatigue_level = Column(Integer, nullable=False)  # 1-10
    dizziness = Column(Boolean, default=False, nullable=False)
    breathing_difficulty = Column(Boolean, default=False, nullable=False)
    injuries = Column(Text, nullable=True)
    pain_level = Column(Integer, default=0, nullable=False)  # 0-10
    hydration_status = Column(String(20), default="adequate", nullable=False)  # 'adequate', 'low', 'dehydrated'
    recommendation = Column(Text, nullable=True)
    severity = Column(String(20), default="normal", nullable=False)  # 'normal', 'caution', 'warning', 'critical'
    submitted_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    worker = relationship("User", back_populates="health_assessments")


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    setting_key = Column(String(100), unique=True, index=True, nullable=False)
    setting_value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

