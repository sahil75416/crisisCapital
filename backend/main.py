"""
Snap_Stake FastAPI Backend
Micro-risk markets platform with ML models and x402 micropayments
"""

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import time
import random
from datetime import datetime, timedelta
import os

app = FastAPI(
    title="Snap_Stake API",
    description="Micro-risk markets platform with AI predictions and x402 micropayments",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class DisruptionAlert(BaseModel):
    id: str
    type: str
    title: str
    description: str
    probability: float
    confidence: float
    time_to_resolution: int
    potential_payout: float
    risk_level: str
    location: Dict[str, Any]

class MLPredictionRequest(BaseModel):
    disruption_type: str
    location: Dict[str, Any]
    context: Optional[Dict[str, Any]] = None

# x402 micropayment configuration
X402_RATE = 10000000000000000  # 0.01 ETH in wei
PAYMENT_ADDRESS = os.getenv("PAYMENT_ADDRESS", "0x742d35Cc6634C0532925a3b8d49D1dFA1aCdE9fE")

# ML Predictor
class MLPredictor:
    @staticmethod
    def predict_disruption(disruption_type: str, location: Dict, context: Dict = None) -> Dict:
        """AI-powered disruption prediction"""
        hour = datetime.now().hour
        base_prob = 0.3
        
        if disruption_type == "delivery":
            # Peak hours increase probability
            if 11 <= hour <= 14 or 18 <= hour <= 21:
                base_prob += 0.25
            # Weather impact
            if context and context.get("weather") == "rain":
                base_prob += 0.15
                
        elif disruption_type == "transit":
            # Rush hour impact
            if 7 <= hour <= 9 or 17 <= hour <= 19:
                base_prob += 0.35
            # Maintenance simulation
            if random.random() < 0.1:
                base_prob += 0.4
                
        elif disruption_type == "flight":
            # Weather heavily impacts flights
            weather = context.get("weather", "clear") if context else "clear"
            if weather in ["storm", "snow", "fog"]:
                base_prob += 0.45
            elif weather == "rain":
                base_prob += 0.2
        
        probability = min(base_prob + random.uniform(-0.1, 0.15), 0.95)
        confidence = 0.75 + random.uniform(0, 0.2)
        
        return {
            "probability": probability,
            "confidence": confidence,
            "estimated_delay": random.randint(10, 45),
            "factors": {
                "time_of_day": hour,
                "weather_impact": context.get("weather", "clear") if context else "clear",
                "historical_pattern": random.choice(["normal", "elevated", "high"])
            }
        }

async def validate_x402_payment(x402_header: Optional[str] = Header(None)) -> bool:
    """Validate x402 micropayment header"""
    if not x402_header:
        return False
    
    try:
        parts = x402_header.split(" ")
        if len(parts) != 3:
            return False
        
        amount, recipient, purpose = parts
        return int(amount) >= X402_RATE and recipient.lower() == PAYMENT_ADDRESS.lower()
    except:
        return False

@app.get("/")
async def root():
    return {
        "message": "Snap_Stake API - Micro-Risk Markets Platform",
        "version": "1.0.0",
        "features": ["AI predictions", "x402 micropayments", "real-time markets"]
    }

@app.get("/disruption-alerts")
async def get_disruption_alerts(limit: int = 10) -> List[DisruptionAlert]:
    """Get real-time disruption alerts with AI predictions"""
    
    alerts = []
    current_time = datetime.now()
    
    # Generate dynamic alerts based on current conditions
    alert_templates = [
        {
            "type": "delivery",
            "title": "DoorDash Peak Hour Delays",
            "description": "High probability of 15+ min delays in downtown",
            "location": {"city": "San Francisco", "area": "downtown"}
        },
        {
            "type": "transit", 
            "title": "Subway System Delays",
            "description": "Signal issues affecting multiple lines",
            "location": {"city": "New York", "system": "MTA"}
        },
        {
            "type": "flight",
            "title": "Airport Weather Delays",
            "description": "Storm system approaching major airports",
            "location": {"airport": "LAX", "city": "Los Angeles"}
        }
    ]
    
    for i, template in enumerate(alert_templates[:limit]):
        # Get AI prediction
        prediction = MLPredictor.predict_disruption(
            template["type"],
            template["location"],
            {"weather": random.choice(["clear", "rain", "storm"])}
        )
        
        # Determine risk level
        prob = prediction["probability"]
        if prob >= 0.8:
            risk_level = "critical"
        elif prob >= 0.65:
            risk_level = "high"
        elif prob >= 0.4:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        alert = DisruptionAlert(
            id=f"alert_{i+1}_{int(time.time())}",
            type=template["type"],
            title=template["title"],
            description=template["description"],
            probability=round(prediction["probability"] * 100, 1),
            confidence=round(prediction["confidence"] * 100, 1),
            time_to_resolution=random.randint(15, 30),
            potential_payout=round(2 + (prediction["probability"] * 3), 1),
            risk_level=risk_level,
            location=template["location"]
        )
        alerts.append(alert)
    
    return alerts

@app.post("/predict")
async def get_ml_prediction(
    request: MLPredictionRequest,
    x402_header: Optional[str] = Header(None, alias="x402-micropayment")
) -> Dict[str, Any]:
    """AI prediction endpoint with x402 micropayment"""
    
    # Validate micropayment
    if not await validate_x402_payment(x402_header):
        raise HTTPException(
            status_code=402,
            detail="Payment required. Include x402-micropayment header with format: 'amount recipient purpose'"
        )
    
    # Generate AI prediction
    prediction = MLPredictor.predict_disruption(
        request.disruption_type,
        request.location,
        request.context
    )
    
    return {
        "prediction": prediction,
        "cost": f"{X402_RATE} wei",
        "timestamp": datetime.now().isoformat(),
        "model_version": "1.0.0"
    }

@app.get("/markets/active")
async def get_active_markets() -> List[Dict]:
    """Get currently active micro-risk markets"""
    
    # Mock active markets
    markets = []
    for i in range(5):
        market = {
            "id": f"market_{i+1}",
            "description": f"Delivery delay in zone {i+1}",
            "type": random.choice(["delivery", "transit", "flight"]),
            "created_at": (datetime.now() - timedelta(minutes=random.randint(5, 25))).isoformat(),
            "resolution_time": (datetime.now() + timedelta(minutes=random.randint(5, 25))).isoformat(),
            "yes_price": round(random.uniform(0.3, 0.7), 3),
            "no_price": round(random.uniform(0.3, 0.7), 3),
            "volume": round(random.uniform(100, 1000), 2),
            "participants": random.randint(5, 50)
        }
        markets.append(market)
    
    return markets

@app.post("/markets/{market_id}/trade")
async def execute_trade(
    market_id: str,
    prediction: bool,
    amount: float,
    user_address: str
) -> Dict[str, Any]:
    """Execute a trade on a micro-risk market"""
    
    # Simulate trade execution
    trade_id = f"trade_{int(time.time())}_{random.randint(1000, 9999)}"
    
    return {
        "trade_id": trade_id,
        "market_id": market_id,
        "prediction": prediction,
        "amount": amount,
        "user_address": user_address,
        "executed_at": datetime.now().isoformat(),
        "estimated_payout": round(amount * random.uniform(1.5, 3.0), 2),
        "status": "executed"
    }

@app.get("/oracle/data-feeds")
async def get_oracle_feeds() -> Dict[str, Any]:
    """Get real-time data feeds for oracle resolution"""
    
    return {
        "delivery_apis": {
            "doordash": {"status": "active", "last_update": datetime.now().isoformat()},
            "ubereats": {"status": "active", "last_update": datetime.now().isoformat()},
            "grubhub": {"status": "maintenance", "last_update": (datetime.now() - timedelta(hours=2)).isoformat()}
        },
        "transit_apis": {
            "gtfs": {"status": "active", "last_update": datetime.now().isoformat()},
            "mta": {"status": "active", "last_update": datetime.now().isoformat()}
        },
        "flight_apis": {
            "flightaware": {"status": "active", "last_update": datetime.now().isoformat()},
            "aviationstack": {"status": "active", "last_update": datetime.now().isoformat()}
        },
        "weather_apis": {
            "noaa": {"status": "active", "last_update": datetime.now().isoformat()},
            "openweather": {"status": "active", "last_update": datetime.now().isoformat()}
        }
    }

@app.get("/analytics/platform")
async def get_platform_analytics() -> Dict[str, Any]:
    """Get platform analytics and metrics"""
    
    return {
        "total_markets": random.randint(150, 300),
        "active_markets": random.randint(20, 50),
        "total_volume": round(random.uniform(50000, 100000), 2),
        "unique_users": random.randint(500, 1500),
        "accuracy_rate": round(random.uniform(0.75, 0.85), 3),
        "avg_resolution_time": f"{random.randint(15, 25)} minutes",
        "top_categories": [
            {"type": "delivery", "volume": random.randint(30, 50)},
            {"type": "transit", "volume": random.randint(25, 40)},
            {"type": "flight", "volume": random.randint(15, 30)}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
