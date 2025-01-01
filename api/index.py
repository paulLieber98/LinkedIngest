from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import json

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLAnalysisRequest(BaseModel):
    url: str
    tone: str = "Professional"
    context: Optional[str] = None

@app.get("/")
@app.get("/api")
async def root():
    """Root endpoint that handles both / and /api"""
    return {
        "message": "LinkedIngest API is running",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/analyze_url")
async def analyze_url(request: URLAnalysisRequest):
    try:
        # For now, return a mock response
        return {
            "success": True,
            "summary": f"""Profile Summary:
• LinkedIn URL: {request.url}
• Tone: {request.tone}
• Context: {request.context if request.context else 'None provided'}

This is a mock summary. The actual implementation will analyze the LinkedIn profile and generate a personalized summary."""
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze_pdf")
async def analyze_pdf(
    file: UploadFile = File(...),
    tone: str = Form("Professional"),
    context: Optional[str] = Form(None)
):
    try:
        # For now, return a mock response
        return {
            "success": True,
            "summary": f"""Profile Summary:
• File: {file.filename}
• Tone: {tone}
• Context: {context if context else 'None provided'}

This is a mock summary. The actual implementation will analyze the PDF and generate a personalized summary."""
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.options("/{full_path:path}")
async def options_route(request: Request, full_path: str):
    """Handle all OPTIONS requests"""
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        },
    ) 