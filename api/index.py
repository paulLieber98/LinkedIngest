from fastapi import FastAPI
from datetime import datetime

app = FastAPI()

@app.get("/api")
async def root():
    return {
        "message": "Welcome to LinkedIngest API!",
        "status": "online",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    } 