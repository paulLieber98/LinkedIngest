from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
import openai

load_dotenv()

app = FastAPI(title="LinkedIngest API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProfileRequest(BaseModel):
    url: str
    tone: Optional[str] = "professional"
    context: Optional[str] = None

class ProfileResponse(BaseModel):
    summary: str
    llm_prompt: str

@app.get("/")
async def read_root():
    return {"status": "healthy", "service": "LinkedIngest API"}

@app.post("/api/analyze", response_model=ProfileResponse)
async def analyze_profile(request: ProfileRequest):
    try:
        # TODO: Implement LinkedIn profile analysis
        # For now, return a mock response
        return ProfileResponse(
            summary="Mock profile summary",
            llm_prompt="Mock LLM prompt for personalized outreach"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 