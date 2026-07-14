from sqlalchemy.orm import Session
from ..models import AuditLog
from typing import Optional

def log_audit(
    db: Session,
    user_id: Optional[int],
    action: str,
    details: Optional[str] = None,
    ip_address: Optional[str] = None
):
    try:
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            details=details,
            ip_address=ip_address
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        # Fallback print if DB logger fails
        print(f"Failed to write audit log: {e}")
