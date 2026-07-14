import os
import random
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import joblib

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
    """Generates simulated live telemetry readings, passes them to the ML model, and returns risk assessment."""
    model = get_model()
    
    # Simulate a variety of scenarios (Normal mostly, occasionally elevated warning, rarely critical)
    scenario = random.choices(["normal", "warning", "critical"], weights=[0.70, 0.20, 0.10])[0]
    
    if scenario == "normal":
        methane = random.uniform(0.05, 0.8)
        co = random.uniform(2.0, 15.0)
        temp = random.uniform(22.0, 31.0)
        humidity = random.uniform(50.0, 75.0)
        air_velocity = random.uniform(0.8, 2.2)
    elif scenario == "warning":
        methane = random.uniform(0.9, 1.8)
        co = random.uniform(20.0, 45.0)
        temp = random.uniform(32.0, 37.0)
        humidity = random.uniform(70.0, 85.0)
        air_velocity = random.uniform(0.4, 0.7)
    else:  # critical
        methane = random.uniform(1.9, 3.4)
        co = random.uniform(46.0, 95.0)
        temp = random.uniform(36.0, 44.0)
        humidity = random.uniform(80.0, 95.0)
        air_velocity = random.uniform(0.1, 0.3)
        
    features = np.array([[methane, co, temp, humidity, air_velocity]])
    
    try:
        risk_level = int(model.predict(features)[0])
        probabilities = model.predict_proba(features)[0]
        max_prob = float(probabilities[risk_level])
        
        status_str, recommendation = get_recommendations_and_status(
            risk_level, methane, co, temp, air_velocity
        )
        
        return {
            "telemetry": {
                "methane_level": round(methane, 2),
                "co_level": round(co, 2),
                "temperature": round(temp, 1),
                "humidity": round(humidity, 1),
                "air_velocity": round(air_velocity, 2)
            },
            "prediction": {
                "risk_level": risk_level,
                "risk_status": status_str,
                "probability": round(max_prob * 100, 1),
                "recommendation": recommendation
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Real-time inference failed: {str(e)}"
        )
