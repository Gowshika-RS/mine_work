from sqlalchemy import text
from app.database import engine

def migrate():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE hazard_reports ADD COLUMN risk_level VARCHAR(50) NULL;"))
            conn.execute(text("ALTER TABLE hazard_reports ADD COLUMN precautions TEXT NULL;"))
            conn.execute(text("ALTER TABLE hazard_reports ADD COLUMN required_ppe TEXT NULL;"))
            conn.execute(text("ALTER TABLE hazard_reports ADD COLUMN immediate_actions TEXT NULL;"))
            conn.execute(text("ALTER TABLE hazard_reports ADD COLUMN notify_who VARCHAR(100) NULL;"))
            conn.execute(text("ALTER TABLE hazard_reports ADD COLUMN ai_analysis JSON NULL;"))
            print("Successfully added AI fields to hazard_reports table.")
        except Exception as e:
            print("Migration error or columns already exist:", e)

if __name__ == "__main__":
    migrate()
