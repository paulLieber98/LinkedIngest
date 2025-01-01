from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
import openai
from utils.profile_processor import ProfileProcessor

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set")

# Initialize FastAPI app
app = FastAPI(title="LinkedIngest API")

# Initialize profile processor
profile_processor = ProfileProcessor(OPENAI_API_KEY)

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
        # Extract profile data
        profile_data = profile_processor.extract_from_url(request.url)
        
        # Generate summary
        summary = profile_processor.generate_summary(
            profile_data,
            tone=request.tone or "professional",
            context=request.context
        )
        
        return {
            "summary": summary,
            "profile_data": profile_data
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
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
        # Read PDF content
        content = await file.read()
        
        # Extract profile data
        profile_data = profile_processor.extract_from_pdf(content)
        
        # Generate summary
        summary = profile_processor.generate_summary(
            profile_data,
            tone=tone,
            context=context
        )
        
        return {
            "summary": summary,
            "profile_data": profile_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 