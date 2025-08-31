from fastapi import FastAPI, HTTPException
from datetime import datetime
from aviation_connector import get_flight_delay

app = FastAPI()

@app.get("/flight/{iata}")
async def flight(iata: str):
    data = get_flight_delay(iata)
    if data["predicted_delay"] == 0:
        return {"probability": 0, "delay": 0}
    return data