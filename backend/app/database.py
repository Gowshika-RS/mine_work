import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Always fallback cleanly to local SQLite database if MySQL URL is not explicitly configured and reachable
DATABASE_URL = os.getenv("DATABASE_URL")

def create_db_engine():
    if DATABASE_URL and "mysql" in DATABASE_URL:
        try:
            eng = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args={"connect_timeout": 1})
            conn = eng.connect()
            conn.close()
            return eng
        except Exception:
            print("[Database System] MySQL server unreachable on port 3306. Switching to local SQLite database (mine_safety.db).")

    # Default to fast local SQLite database
    sqlite_url = "sqlite:///./mine_safety.db"
    return create_engine(sqlite_url, connect_args={"check_same_thread": False})

engine = create_db_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
