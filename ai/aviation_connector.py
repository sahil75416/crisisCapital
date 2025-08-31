import os, datetime
import requests

AVIATION_URL = "https://api.aviationstack.com/v1/flights"

def get_flight_delay(flight_iata: str) -> dict:
    """
    Returns {probability: 0-1, predicted_delay: minutes} for any IATA flight.
    """
    params = {
        "access_key": os.getenv("AVIATIONSTACK_KEY"),
        "flight_iata": flight_iata,
        "limit": 1,
    }
    r = requests.get(AVIATION_URL, params=params, timeout=10)
    r.raise_for_status()
    data = r.json().get("data", [])
    if not data:
        return {"probability": 0, "predicted_delay": 0}

    flight = data[0]
    delay = flight["arrival"]["delay"] or 0
    probability = min(1.0, delay / 120)  # 0-120 min → 0-1
    return {
        "crisis_type": "flight_delay",
        "probability": probability,
        "predicted_delay": delay,
        "confidence": 0.9,
    }