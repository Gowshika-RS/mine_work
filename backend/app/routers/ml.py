import os
import numpy as np
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import joblib
from ..utils.dataset_metrics import get_dataset_metrics

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

# Path to the trained model
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'ml_model.pkl')

class PredictionInput(BaseModel):
    methane_level: float
    co_level: float
    temperature: float
    humidity: float
    air_velocity: float

class PredictionOutput(BaseModel):
    risk_level: int
    risk_status: str
    probability: float
    recommendation: str

# Helper to load the model on demand
def get_model():
    if not os.path.exists(MODEL_PATH):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML Model not trained. Please run training script first."
        )
    try:
        return joblib.load(MODEL_PATH)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading model: {str(e)}"
        )

def get_recommendations_and_status(risk_level: int, methane: float, co: float, temp: float, air_vel: float) -> tuple:
    if risk_level == 2:
        status = "Critical"
        recs = []
        if methane >= 2.0:
            recs.append("CRITICAL: Methane levels are dangerously high! Evacuate immediately.")
        if co >= 50.0:
            recs.append("CRITICAL: Carbon Monoxide is toxic! Wear respirator and exit area.")
        if temp >= 38.0:
            recs.append("CRITICAL: High thermal stress detected. Retreat to cooling station.")
        if air_vel <= 0.3:
            recs.append("CRITICAL: Poor ventilation. Turn on auxiliary fans.")
        if not recs:
            recs.append("CRITICAL: Multiple sensors indicating extreme hazard. Initiate evacuation protocols.")
        return status, " | ".join(recs)
        
    elif risk_level == 1:
        status = "Warning"
        recs = []
        if methane >= 1.0:
            recs.append("Methane levels elevated. Increase ventilation.")
        if co >= 25.0:
            recs.append("Carbon Monoxide rising. Monitor breathing.")
        if temp >= 33.0:
            recs.append("High temperature. Take short hydration break.")
        if air_vel <= 0.6:
            recs.append("Low air velocity. Report ventilation issues.")
        if not recs:
            recs.append("Minor anomalies detected. Maintain vigilance.")
        return status, " | ".join(recs)
        
    else:
        status = "Safe"
        return status, "All parameters normal. Continue standard operations with regular PPE checks."

@router.post("/predict", response_model=PredictionOutput)
def predict_hazard_risk(payload: PredictionInput):
    model = get_model()
    
    # Prepare data for prediction
    features = np.array([[
        payload.methane_level,
        payload.co_level,
        payload.temperature,
        payload.humidity,
        payload.air_velocity
    ]])
    
    try:
        risk_level = int(model.predict(features)[0])
        probabilities = model.predict_proba(features)[0]
        max_prob = float(probabilities[risk_level])
        
        status_str, recommendation = get_recommendations_and_status(
            risk_level, 
            payload.methane_level, 
            payload.co_level, 
            payload.temperature, 
            payload.air_velocity
        )
        
        return {
            "risk_level": risk_level,
            "risk_status": status_str,
            "probability": max_prob,
            "recommendation": recommendation
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failed: {str(e)}"
        )

@router.get("/realtime-telemetry")
def get_realtime_telemetry():
    """Return dataset-derived telemetry metrics and a risk assessment based on those values."""
    metrics = get_dataset_metrics()

    if not metrics.get("available", False):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=metrics.get("reason", "Dataset is unavailable")
        )

    image_count = metrics["image_count"]
    sitting_ratio = metrics["sitting_ratio"]
    standing_ratio = metrics["standing_ratio"]

    methane = round(max(0.05, min(3.5, 0.2 + (sitting_ratio / 100) * 1.4)), 2)
    co = round(max(2.0, min(95.0, 8.0 + (standing_ratio / 100) * 40.0)), 2)
    temp = round(max(22.0, min(44.0, 25.0 + (image_count % 7) * 1.6)), 1)
    humidity = round(max(40.0, min(95.0, 58.0 + (metrics["annotation_count"] % 5) * 4.0)), 1)
    air_velocity = round(max(0.1, min(3.0, 1.0 + (metrics["average_box_area"] / 1000.0) * 0.02)), 2)

    features = np.array([[methane, co, temp, humidity, air_velocity]])

    try:
        model = get_model()
        risk_level = int(model.predict(features)[0])
        probabilities = model.predict_proba(features)[0]
        max_prob = float(probabilities[risk_level])

        status_str, recommendation = get_recommendations_and_status(
            risk_level, methane, co, temp, air_velocity
        )

        return {
            "telemetry": {
                "methane_level": methane,
                "co_level": co,
                "temperature": temp,
                "humidity": humidity,
                "air_velocity": air_velocity,
                "dataset_summary": {
                    "image_count": image_count,
                    "annotation_count": metrics["annotation_count"],
                    "sitting_ratio": sitting_ratio,
                    "standing_ratio": standing_ratio,
                },
            },
            "prediction": {
                "risk_level": risk_level,
                "risk_status": status_str,
                "probability": round(max_prob * 100, 1),
                "recommendation": recommendation,
            },
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Real-time inference failed: {str(e)}"
        )
