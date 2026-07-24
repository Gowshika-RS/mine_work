import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "mysql+pymysql://root:rootpassword@localhost:3306/mine_safety"

def create_db_engine():
    connect_args = {}
    if "sqlite" in DATABASE_URL:
        connect_args["check_same_thread"] = False
        return create_engine(DATABASE_URL, connect_args=connect_args)
    
    try:
        eng = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)
        # Test connection
        conn = eng.connect()
        conn.close()
        return eng
    except Exception as e:
        print(f"[Database Warning] Could not connect to primary database ({DATABASE_URL}). Falling back to SQLite for offline execution. Error: {e}")
        fallback_url = "sqlite:///./mine_safety.db"
        return create_engine(fallback_url, connect_args={"check_same_thread": False})

engine = create_db_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
