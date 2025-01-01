from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

app = FastAPI()

class ProfileRequest(BaseModel):
    url: str
    tone: str = "Professional"
    context: Optional[str] = None

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/analyze")
async def analyze_profile(request: ProfileRequest):
    try:
        return {
            "success": True,
            "message": "Profile analysis request received",
            "data": {
                "url": request.url,
                "tone": request.tone,
                "context": request.context,
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 