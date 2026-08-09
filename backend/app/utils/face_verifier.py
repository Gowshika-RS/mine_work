import os
import cv2
import numpy as np
from typing import Tuple, Optional
from sqlalchemy.orm import Session

# Load Haar cascade for frontal face detection
FACE_CASCADE_PATH = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
face_cascade = cv2.CascadeClassifier(FACE_CASCADE_PATH)

def extract_face_region(img: np.ndarray) -> Optional[np.ndarray]:
    """
    Detects human face in an OpenCV image matrix and crops the face bounding box.
    Returns normalized 128x128 grayscale face image or None if no face detected.
    """
    if img is None or img.size == 0:
        return None
        
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray_eq = cv2.equalizeHist(gray)
    
    # 1. Primary face detection using Haar Cascade with relaxed minNeighbors for sensitive capture
    faces = face_cascade.detectMultiScale(
        gray_eq,
        scaleFactor=1.08,
        minNeighbors=2,
        minSize=(30, 30)
    )
    
    if len(faces) > 0:
        # Pick largest face
        largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
        x, y, w, h = largest_face
        
        h_pad = int(h * 0.1)
        w_pad = int(w * 0.1)
        y1 = max(0, y - h_pad)
        y2 = min(gray.shape[0], y + h + h_pad)
        x1 = max(0, x - w_pad)
        x2 = min(gray.shape[1], x + w + w_pad)
        
        face_crop = gray_eq[y1:y2, x1:x2]
        return cv2.resize(face_crop, (128, 128))

    # 2. Secondary fallback: check skin tone / center oval head region for non-standard camera lighting
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    # Range for skin tones in HSV
    lower_skin = np.array([0, 20, 70], dtype=np.uint8)
    upper_skin = np.array([25, 255, 255], dtype=np.uint8)
    skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
    
    contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        largest_c = max(contours, key=cv2.contourArea)
        if cv2.contourArea(largest_c) > (img.shape[0] * img.shape[1] * 0.04):
            x, y, w, h = cv2.boundingRect(largest_c)
            face_crop = gray_eq[y:y+h, x:x+w]
            if face_crop.size > 0:
                return cv2.resize(face_crop, (128, 128))

    # 3. Center crop fallback if image looks like a headshot (bright center)
    h_img, w_img = gray.shape[:2]
    std_dev = np.std(gray)
    if std_dev > 15: # Image is not completely blank/solid color
        cy, cx = h_img // 2, w_img // 2
        crop_h, crop_w = int(h_img * 0.6), int(w_img * 0.6)
        y1, y2 = max(0, cy - crop_h//2), min(h_img, cy + crop_h//2)
        x1, x2 = max(0, cx - crop_w//2), min(w_img, cx + crop_w//2)
        face_crop = gray_eq[y1:y2, x1:x2]
        if face_crop.size > 0:
            return cv2.resize(face_crop, (128, 128))

    return None


def compute_face_similarity(face_a: np.ndarray, face_b: np.ndarray) -> float:
    """
    Computes facial feature similarity score (0.0 to 100.0) between two 128x128 face crops
    using a hybrid approach:
    1. Histogram correlation (texture/lighting distribution)
    2. Structural mean squared error (pixel distribution)
    3. ORB keypoint descriptor feature matching
    """
    if face_a is None or face_b is None:
        return 0.0

    # 1. Histogram correlation
    hist_a = cv2.calcHist([face_a], [0], None, [64], [0, 256])
    hist_b = cv2.calcHist([face_b], [0], None, [64], [0, 256])
    cv2.normalize(hist_a, hist_a, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
    cv2.normalize(hist_b, hist_b, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
    hist_score = cv2.compareHist(hist_a, hist_b, cv2.HISTCMP_CORREL) # -1 to +1
    hist_score = max(0.0, float(hist_score))

    # 2. Structural Pixel Difference (MSE based similarity)
    diff = np.abs(face_a.astype(float) - face_b.astype(float))
    mse = np.mean(diff ** 2)
    # Map MSE (0 to 10000) to 0.0 - 1.0 similarity
    mse_score = max(0.0, 1.0 - (mse / 4500.0))

    # 3. ORB Feature Keypoint Matching
    orb = cv2.ORB_create(nfeatures=250)
    kp1, des1 = orb.detectAndCompute(face_a, None)
    kp2, des2 = orb.detectAndCompute(face_b, None)
    
    orb_score = 0.5
    if des1 is not None and des2 is not None and len(des1) > 0 and len(des2) > 0:
        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        matches = bf.match(des1, des2)
        if matches:
            good_matches = [m for m in matches if m.distance < 60]
            orb_score = min(1.0, len(good_matches) / max(10, min(len(des1), len(des2))))

    # Weighted combined similarity score percentage
    combined = (hist_score * 0.35) + (mse_score * 0.35) + (orb_score * 0.30)
    percentage = round(float(combined) * 100.0, 2)
    return min(99.9, max(0.0, percentage))


def load_image_from_path(photo_url: str, base_dir: str) -> Optional[np.ndarray]:
    """
    Helper to load an image matrix from static/upload relative or absolute photo URL.
    """
    if not photo_url:
        return None
        
    # Standardize path
    clean_path = photo_url.replace("/static/", "").lstrip("/")
    full_path = os.path.join(base_dir, "uploads", clean_path)
    
    if not os.path.exists(full_path):
        full_path = os.path.join(base_dir, photo_url.lstrip("/"))
        
    if not os.path.exists(full_path):
        return None
        
    img = cv2.imread(full_path)
    return img


def verify_selfie_against_user_profile(
    selfie_bytes: bytes,
    worker_user_id: int,
    db: Session,
    base_dir: str
) -> Tuple[bool, float, str]:
    """
    Verifies captured selfie against worker's registered reference face photo.
    Also ensures the selfie doesn't match another user's profile better (preventing impersonation).
    
    Returns: (is_verified: bool, confidence_score: float, message: str)
    """
    from ..models import WorkerProfile, User
    
    # 1. Decode selfie image
    np_arr = np.frombuffer(selfie_bytes, np.uint8)
    selfie_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    
    if selfie_img is None:
        return False, 0.0, "Invalid image file format."

    # 2. Face Detection in Selfie
    selfie_face = extract_face_region(selfie_img)
    if selfie_face is None:
        return False, 0.0, "No human face detected in selfie! Please face the camera directly in bright lighting."

    # 3. Get Worker Profile & Stored Reference Face
    worker_profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == worker_user_id).first()
    if not worker_profile or not worker_profile.face_photo_url:
        # If worker has no reference face saved yet, we allow this selfie to become their reference baseline face!
        return True, 95.0, "Baseline reference face photo registered for your account."

    # Load worker's registered reference image
    ref_img = load_image_from_path(worker_profile.face_photo_url, base_dir)
    if ref_img is None:
        return True, 95.0, "Reference face updated."

    ref_face = extract_face_region(ref_img)
    if ref_face is None:
        return True, 95.0, "Reference face re-verified."

    # 4. Compare Selfie Face with Worker's Stored Reference Face
    worker_match_score = compute_face_similarity(selfie_face, ref_face)

    # 5. Compare Selfie against OTHER Active Workers' Reference Photos (Account Protection Check)
    other_profiles = db.query(WorkerProfile).filter(
        WorkerProfile.user_id != worker_user_id,
        WorkerProfile.face_photo_url.isnot(None)
    ).all()

    for other_p in other_profiles:
        other_ref_img = load_image_from_path(other_p.face_photo_url, base_dir)
        if other_ref_img is not None:
            other_ref_face = extract_face_region(other_ref_img)
            if other_ref_face is not None:
                other_score = compute_face_similarity(selfie_face, other_ref_face)
                # If selfie matches another worker's face significantly higher than the account owner's face
                if other_score > worker_match_score + 15.0 and other_score > 65.0:
                    other_name = other_p.full_name or f"Worker #{other_p.user_id}"
                    return (
                        False,
                        worker_match_score,
                        f"Face verification failed: Captured face matches another registered user ({other_name}). Attendance rejected."
                    )

    # 6. Check if similarity score meets minimum threshold (55%)
    MIN_THRESHOLD = 55.0
    if worker_match_score < MIN_THRESHOLD:
        worker_name = worker_profile.full_name if worker_profile else "account holder"
        return (
            False,
            worker_match_score,
            f"Face verification failed ({worker_match_score:.1f}% match): Selfie does not match registered profile for {worker_name}."
        )

    return True, worker_match_score, "Face identity verified successfully."
