from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import json
import os
import openai
from bs4 import BeautifulSoup
import httpx
import re
from io import BytesIO
from PyPDF2 import PdfReader

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

class URLAnalysisRequest(BaseModel):
    url: str

def extract_profile_info(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Extract text content
    text_content = soup.get_text(separator=' ', strip=True)
    
    # Basic cleaning
    text_content = re.sub(r'\s+', ' ', text_content)
    text_content = text_content.strip()
    
    return text_content

def extract_text_from_pdf(pdf_content):
    try:
        # Create a BytesIO object from the PDF content
        pdf_file = BytesIO(pdf_content)
        
        # Create a PDF reader object
        pdf_reader = PdfReader(pdf_file)
        
        # Extract text from all pages
        text_content = []
        for page in pdf_reader.pages:
            text_content.append(page.extract_text())
        
        # Join all pages with newlines
        full_text = "\n".join(text_content)
        
        # Basic cleaning
        full_text = re.sub(r'\s+', ' ', full_text)
        full_text = full_text.strip()
        
        return full_text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

def analyze_with_gpt(profile_text):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert at analyzing LinkedIn profiles and creating concise, informative summaries. 
                    Focus on extracting and highlighting key professional details including:
                    - Current role and company
                    - Key skills and expertise
                    - Professional experience highlights
                    - Educational background
                    - Notable achievements
                    
                    Format the summary in a clear, bullet-point style that's easy to read and understand.
                    Be direct and professional in your analysis."""
                },
                {
                    "role": "user",
                    "content": f"Please analyze this LinkedIn profile content and create a professional summary:\n\n{profile_text}"
                }
            ],
            temperature=0.7,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in GPT analysis: {str(e)}")

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
        # Validate URL
        if not request.url.startswith(('http://', 'https://')):
            request.url = 'https://' + request.url

        if 'linkedin.com' not in request.url:
            raise HTTPException(status_code=400, detail="Please provide a valid LinkedIn URL")

        # Fetch profile content
        async with httpx.AsyncClient() as client:
            response = await client.get(request.url)
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch LinkedIn profile")

        # Extract profile information
        profile_text = extract_profile_info(response.text)
        
        # Analyze with GPT
        summary = analyze_with_gpt(profile_text)

        return {
            "success": True,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze_pdf")
async def analyze_pdf(file: UploadFile = File(...)):
    try:
        # Read PDF content
        content = await file.read()
        
        # Extract text from PDF
        text_content = extract_text_from_pdf(content)
        
        # Analyze with GPT
        summary = analyze_with_gpt(text_content)

        return {
            "success": True,
            "summary": summary
        }
    except Exception as e:
        print(f"Error in analyze_pdf: {str(e)}")  # Add debugging
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