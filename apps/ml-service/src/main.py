from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
import xgboost as xgb
from datetime import datetime
import os

app = FastAPI(title="RoadSense ML API", version="1.0.0")

class PredictionRequest(BaseModel):
    vehicle_id: str
    stress_exposure_count: int
    average_road_stress: float
    high_stress_trip_count: int
    harsh_braking_count: int
    vibration_anomaly_count: int
    suspension_event_count: int
    temperature_anomaly_count: int
    vehicle_age: int
    odometer: float

# Placeholder for loaded model
model = None

@app.on_event("startup")
async def load_model():
    global model
    # Normally we would load a trained model:
    # model = xgb.Booster()
    # model.load_model("model.json")
    print("Initializing dummy ML model (Synthetic predictions enabled)")

@app.get("/api/v1/ml/metrics")
async def get_metrics():
    # Synthetic metrics
    return {
        "accuracy": 0.92,
        "precision": 0.89,
        "recall": 0.85,
        "f1": 0.87,
        "roc_auc": 0.94,
        "model_version": "v1.0.0-synthetic"
    }

@app.post("/api/v1/ml/predict")
async def predict_risk(req: PredictionRequest):
    # For hackathon/demo purposes without pre-trained weights,
    # generate a realistic synthetic prediction based on feature values
    
    risk_score = 0.0
    
    # Simple synthetic scoring algorithm mimicking XGBoost splits
    risk_score += (req.high_stress_trip_count * 0.15)
    risk_score += (req.vibration_anomaly_count * 0.20)
    risk_score += (req.suspension_event_count * 0.30)
    risk_score += (req.average_road_stress * 0.05)
    
    if req.odometer > 100000:
        risk_score += 0.1
        
    risk_probability = min(max(risk_score, 0.0), 1.0)
    
    if risk_probability > 0.8:
        risk_level = "CRITICAL"
    elif risk_probability > 0.5:
        risk_level = "HIGH"
    elif risk_probability > 0.3:
        risk_level = "ELEVATED"
    else:
        risk_level = "NORMAL"
        
    return {
        "vehicle_id": req.vehicle_id,
        "risk_probability": round(risk_probability, 3),
        "risk_level": risk_level,
        "top_contributing_features": ["suspension_event_count", "high_stress_trip_count"],
        "model_version": "v1.0.0-synthetic",
        "timestamp": datetime.utcnow().isoformat()
    }
