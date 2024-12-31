from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProfileRequest(BaseModel):
    url: Optional[str] = None
    tone: Optional[str] = "professional"
    context: Optional[str] = None

# Mount the React build directory
app.mount("/static", StaticFiles(directory="../frontend/build/static"), name="static")

@app.get("/")
async def read_root():
    return FileResponse("../frontend/build/index.html")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if os.path.exists(f"../frontend/build/{full_path}"):
        return FileResponse(f"../frontend/build/{full_path}")
    return FileResponse("../frontend/build/index.html")

@app.post("/api/analyze/url")
async def analyze_profile_url(request: ProfileRequest):
    if not request.url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    try:
        # TODO: Implement profile extraction and summarization
        summary = "Profile summary will be implemented here"
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/pdf")
async def analyze_profile_pdf(
    file: UploadFile = File(...),
    tone: str = "professional",
    context: Optional[str] = None
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    try:
        # TODO: Implement PDF parsing and summarization
        summary = "PDF summary will be implemented here"
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 