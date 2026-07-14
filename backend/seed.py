import os
import sys
from datetime import date, datetime
from decimal import Decimal

# Add parent directory to path so app can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, SessionLocal, Base
from app.models import User, WorkerProfile, SafetyScore, MineZone
from app.auth.security import get_password_hash

def seed_db():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Seed Admin
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            print("Seeding admin user...")
            admin = User(
                username="admin",
                email="admin@minesafety.com",
                hashed_password=get_password_hash("adminpassword"),
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
        else:
            print("Admin user already exists.")

        # 2. Seed Workers
        workers_data = [
            {
                "username": "john_doe",
                "email": "john.doe@minesafety.com",
                "password": "workerpassword",
                "employee_id": "EMP-0001",
                "full_name": "John Doe",
                "age": 32,
                "gender": "Male",
                "phone_number": "+15550199",
                "emergency_contact_name": "Mary Doe",
                "emergency_contact_number": "+15550198",
                "address": "456 Granite Rd, Mining Town",
                "blood_group": "O+",
                "medical_conditions": "None",
                "department": "Excavation",
                "mine_location": "Shaft 3",
                "designation": "Drill Operator",
                "safety_score": Decimal("98.50")
            },
            {
                "username": "jane_smith",
                "email": "jane.smith@minesafety.com",
                "password": "workerpassword",
                "employee_id": "EMP-0002",
                "full_name": "Jane Smith",
                "age": 28,
                "gender": "Female",
                "phone_number": "+15550201",
                "emergency_contact_name": "Robert Smith",
                "emergency_contact_number": "+15550202",
                "address": "789 Quartz Ave, Mining Town",
                "blood_group": "A-",
                "medical_conditions": "Mild asthma",
                "department": "Operations",
                "mine_location": "Shaft 1",
                "designation": "Haul Truck Driver",
                "safety_score": Decimal("95.00")
            },
            {
                "username": "bob_johnson",
                "email": "bob.johnson@minesafety.com",
                "password": "workerpassword",
                "employee_id": "EMP-0003",
                "full_name": "Bob Johnson",
                "age": 45,
                "gender": "Male",
                "phone_number": "+15550303",
                "emergency_contact_name": "Alice Johnson",
                "emergency_contact_number": "+15550304",
                "address": "12 Limestone Dr, Mining Town",
                "blood_group": "B+",
                "medical_conditions": "High Blood Pressure",
                "department": "Ventilation",
                "mine_location": "Tunnel B",
                "designation": "Ventilation Technician",
                "safety_score": Decimal("68.00") # Low score to trigger alerts
            }
        ]
        
        for w in workers_data:
            user = db.query(User).filter(User.username == w["username"]).first()
            if not user:
                print(f"Seeding worker: {w['username']}...")
                user = User(
                    username=w["username"],
                    email=w["email"],
                    hashed_password=get_password_hash(w["password"]),
                    role="worker",
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                
                profile = WorkerProfile(
                    user_id=user.id,
                    employee_id=w["employee_id"],
                    full_name=w["full_name"],
                    age=w["age"],
                    gender=w["gender"],
                    phone_number=w["phone_number"],
                    emergency_contact_name=w["emergency_contact_name"],
                    emergency_contact_number=w["emergency_contact_number"],
                    address=w["address"],
                    blood_group=w["blood_group"],
                    medical_conditions=w["medical_conditions"],
                    department=w["department"],
                    mine_location=w["mine_location"],
                    designation=w["designation"],
                    joining_date=date.today(),
                    safety_score=w["safety_score"]
                )
                db.add(profile)
                
                # Add initial safety score log
                score_log = SafetyScore(
                    worker_id=user.id,
                    score=w["safety_score"],
                    reason="Initial score seeding"
                )
                db.add(score_log)
                db.commit()
            else:
                print(f"Worker {w['username']} already exists.")

        # 3. Seed Mine Zones
        zones_data = [
            {
                "name": "Shaft 3 Blasting Area",
                "zone_type": "restricted",
                "geometry_type": "circle",
                "coordinates": {
                    "latitude": 34.0522,
                    "longitude": -118.2437,
                    "radius": 100 # meters
                }
            },
            {
                "name": "Tunnel B High Dust Zone",
                "zone_type": "high_risk",
                "geometry_type": "circle",
                "coordinates": {
                    "latitude": 34.0530,
                    "longitude": -118.2420,
                    "radius": 80 # meters
                }
            },
            {
                "name": "Primary Assembly Point A",
                "zone_type": "assembly",
                "geometry_type": "circle",
                "coordinates": {
                    "latitude": 34.0510,
                    "longitude": -118.2450,
                    "radius": 50 # meters
                }
            },
            {
                "name": "Emergency Exit North",
                "zone_type": "emergency_exit",
                "geometry_type": "circle",
                "coordinates": {
                    "latitude": 34.0550,
                    "longitude": -118.2400,
                    "radius": 60 # meters
                }
            },
            {
                "name": "Shaft 1 Safe Zone",
                "zone_type": "safe",
                "geometry_type": "circle",
                "coordinates": {
                    "latitude": 34.0490,
                    "longitude": -118.2480,
                    "radius": 150 # meters
                }
            }
        ]
        
        for z in zones_data:
            zone = db.query(MineZone).filter(MineZone.name == z["name"]).first()
            if not zone:
                print(f"Seeding mine zone: {z['name']}...")
                zone = MineZone(
                    name=z["name"],
                    zone_type=z["zone_type"],
                    geometry_type=z["geometry_type"],
                    coordinates=z["coordinates"]
                )
                db.add(zone)
        
        db.commit()
        print("Database seeding completed successfully.")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
