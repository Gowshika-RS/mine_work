from fastapi.testclient import TestClient

from app.main import app
from app.database import SessionLocal, Base, engine
from app.models import User
from app.auth.security import get_password_hash

client = TestClient(app)


def setup_module(module):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == 'supervisor').first()
        if not existing:
            db.add(User(
                username='supervisor',
                email='supervisor@minesafety.com',
                hashed_password=get_password_hash('supervisorpassword'),
                role='supervisor',
                is_active=True,
            ))
            db.commit()
    finally:
        db.close()


def test_supervisor_overview_requires_authentication():
    response = client.get('/api/supervisor/overview')
    assert response.status_code == 401


def test_supervisor_login_and_overview():
    login_response = client.post('/api/auth/login', json={
        'username': 'supervisor',
        'password': 'supervisorpassword',
    })
    assert login_response.status_code == 200
    token = login_response.json()['access_token']

    overview_response = client.get('/api/supervisor/overview', headers={'Authorization': f'Bearer {token}'})
    assert overview_response.status_code == 200
    payload = overview_response.json()
    assert 'live_workers' in payload
    assert 'active_alerts' in payload
