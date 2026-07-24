import os
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .database import engine, Base, get_db, SessionLocal
from .config import settings
from .websocket import manager
from .routers import auth, users, workers, shifts, locations, hazards, safety, sos, notifications, reports, supervisor, ai_hazard
from .models import MineZone, User
from .auth.security import get_password_hash

# Auto-create tables (handy for quick deployment/development setups)
Base.metadata.create_all(bind=engine)


def ensure_supervisor_user():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == "supervisor").first()
        if not existing:
            supervisor_user = User(
                username="supervisor",
                email="supervisor@minesafety.com",
                hashed_password=get_password_hash("supervisorpassword"),
                role="supervisor",
                is_active=True,
            )
            db.add(supervisor_user)
            db.commit()
    finally:
        db.close()


def ensure_admin_user():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == "admin").first()
        if not existing:
            admin_user = User(
                username="admin",
                email="admin@minesafety.com",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True,
            )
            db.add(admin_user)
            db.commit()
    finally:
        db.close()


ensure_supervisor_user()
ensure_admin_user()

# Set up Rate Limiter
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title="Mine Worker Safety Management System API",
    description="Backend API for Role-Based Access Control, shift logging, real-time safety monitoring, and SOS response.",
    version="1.0.0"
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists and mount static folder for file access
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=settings.UPLOAD_DIR), name="static")

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(workers.router, prefix="/api")
app.include_router(shifts.router, prefix="/api")
app.include_router(locations.router, prefix="/api")
app.include_router(hazards.router, prefix="/api")
app.include_router(safety.router, prefix="/api")
app.include_router(ai_hazard.router, prefix="/api")
# app.include_router(sos.router, prefix="/api")
# app.include_router(notifications.router, prefix="/api")
# app.include_router(reports.router, prefix="/api")

# @app.get("/")
# @limiter.limit("5/minute")
# def root():
#     return {
#         "status": "online",
#         "system": "Mine Worker Safety Management System",
#         "documentation": "/docs"
#     }

# # --- WebSocket Route ---

# @app.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
#     connection_details = await manager.connect(websocket, token)
#     if not connection_details:
#         return
        
#     user_id, role = connection_details
#     try:
#         while True:
#             # Maintain connection, handle client pings
#             data = await websocket.receive_text()
#             try:
#                 msg = json.loads(data)
#                 if msg.get("type") == "ping":
#                     await websocket.send_text(json.dumps({"type": "pong"}))
#             except Exception:
#                 pass
#     except WebSocketDisconnect:
#         manager.disconnect(user_id, role)
import os
import json

from fastapi import (
    FastAPI,
    WebSocket,
    WebSocketDisconnect,
    Query,
    Request
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .database import engine, Base
from .config import settings
from .websocket import manager

from .routers import (
    auth,
    users,
    workers,
    shifts,
    locations,
    hazards,
    safety,
    sos,
    notifications,
    reports,
    ml,
    analytics,
    messages,
    training,
    health,
    ai_assistant,
    admin,
)

# --------------------------------------------------
# Create Database Tables
# --------------------------------------------------

Base.metadata.create_all(bind=engine)

# --------------------------------------------------
# Rate Limiter
# --------------------------------------------------

limiter = Limiter(key_func=get_remote_address)

# --------------------------------------------------
# FastAPI App
# --------------------------------------------------

app = FastAPI(
    title="Mine Worker Safety Management System API",
    description="Backend API for Role-Based Access Control, Shift Monitoring, Hazard Reporting, Live Tracking, and SOS Alerts.",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler
)

# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],  # Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Static Files
# --------------------------------------------------

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app.mount(
    "/static",
    StaticFiles(directory=settings.UPLOAD_DIR),
    name="static"
)

# --------------------------------------------------
# Routers
# --------------------------------------------------

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(workers.router, prefix="/api")
app.include_router(shifts.router, prefix="/api")
app.include_router(locations.router, prefix="/api")
app.include_router(hazards.router, prefix="/api")
app.include_router(safety.router, prefix="/api")
app.include_router(sos.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(ml.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(messages.router, prefix="/api")
app.include_router(training.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(ai_assistant.router, prefix="/api")
app.include_router(supervisor.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

# --------------------------------------------------
# Root Endpoint
# --------------------------------------------------

@app.get("/")
@limiter.limit("5/minute")
async def root(request: Request):
    return {
        "status": "online",
        "system": "Mine Worker Safety Management System",
        "documentation": "/docs"
    }

# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/health")
async def health_check():
    return {
        "status": "healthy"
    }

# --------------------------------------------------
# WebSocket Endpoint
# --------------------------------------------------

@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    connection_details = await manager.connect(
        websocket,
        token
    )

    if not connection_details:
        return

    user_id, role = connection_details

    try:
        while True:
            data = await websocket.receive_text()

            try:
                message = json.loads(data)

                if message.get("type") == "ping":
                    await websocket.send_text(
                        json.dumps(
                            {
                                "type": "pong"
                            }
                        )
                    )

            except Exception:
                pass

    except WebSocketDisconnect:
        manager.disconnect(user_id, role)