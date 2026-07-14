import os
import uuid
from fastapi import UploadFile, HTTPException
from ..config import settings

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}

def save_uploaded_file(file: UploadFile) -> str:
    # Extract file extension and validate
    _, ext = os.path.splitext(file.filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file format. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Create secure random filename
    filename = f"{uuid.uuid4()}{ext}"
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not save file: {str(e)}"
        )
        
    return f"/static/{filename}"
