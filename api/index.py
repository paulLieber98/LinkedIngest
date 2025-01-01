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
    allow_origins=[
        "https://linkedingest.com",
        "https://www.linkedingest.com",
        "http://linkedingest.com",
        "http://www.linkedingest.com",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

class URLAnalysisRequest(BaseModel):
    url: str
    tone: str = "Professional"
    context: Optional[str] = None

@app.get("/")
async def root():
    return {
        "message": "LinkedIngest API is running",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api")
async def api_root():
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

@app.options("/api/{path:path}")
async def options_route(request: Request):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    )

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