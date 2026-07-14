from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Set
from jose import jwt
from .config import settings
from .database import SessionLocal
from .models import User
import json

class ConnectionManager:
    def __init__(self):
        # active_connections maps user_id -> WebSocket
        self.active_connections: Dict[int, WebSocket] = {}
        # role_connections maps role -> Set of user_ids
        self.role_connections: Dict[str, Set[int]] = {
            "admin": set(),
            "worker": set()
        }

    async def connect(self, websocket: WebSocket, token: str):
        await websocket.accept()
        try:
            # Decode token to authenticate WebSocket connection
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            username = payload.get("sub")
            role = payload.get("role")
            
            db = SessionLocal()
            user = db.query(User).filter(User.username == username).first()
            db.close()
            
            if not user:
                await websocket.close(code=4003)  # Forbidden
                return None
                
            user_id = user.id
            
            # Save connection
            self.active_connections[user_id] = websocket
            self.role_connections[role].add(user_id)
            
            print(f"WebSocket connected: User {username} (ID: {user_id}, Role: {role})")
            return user_id, role
            
        except Exception as e:
            print(f"WebSocket authentication error: {e}")
            await websocket.close(code=4002)  # Unauthorized
            return None

    def disconnect(self, user_id: int, role: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if role in self.role_connections and user_id in self.role_connections[role]:
            self.role_connections[role].remove(user_id)
        print(f"WebSocket disconnected: User ID {user_id}")

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_text(json.dumps(message))

    async def broadcast_to_role(self, message: dict, role: str):
        user_ids = list(self.role_connections.get(role, []))
        for uid in user_ids:
            if uid in self.active_connections:
                try:
                    await self.active_connections[uid].send_text(json.dumps(message))
                except Exception as e:
                    print(f"Error broadcasting to user {uid}: {e}")
                    # Auto clean-up
                    self.disconnect(uid, role)

    async def broadcast_global(self, message: dict):
        # Send to everyone
        for uid, websocket in list(self.active_connections.items()):
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                print(f"Error global broadcasting to user {uid}: {e}")
                # We don't know the role here directly, clean up on disconnect exception

manager = ConnectionManager()
