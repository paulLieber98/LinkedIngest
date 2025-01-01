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
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    logger.error("OPENAI_API_KEY environment variable is not set")
else:
    logger.info("OPENAI_API_KEY is configured")
openai.api_key = api_key

class URLAnalysisRequest(BaseModel):
    url: str

def extract_profile_info(html_content):
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Extract text content
        text_content = soup.get_text(separator=' ', strip=True)
        
        # Basic cleaning
        text_content = re.sub(r'\s+', ' ', text_content)
        text_content = text_content.strip()
        
        logger.info(f"Successfully extracted profile info, length: {len(text_content)}")
        return text_content
    except Exception as e:
        logger.error(f"Error in extract_profile_info: {str(e)}")
        raise

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
        
        logger.info(f"Successfully extracted PDF text, length: {len(full_text)}")
        return full_text
    except Exception as e:
        logger.error(f"Error in extract_text_from_pdf: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

def analyze_with_gpt(profile_text):
    try:
        if not openai.api_key:
            raise ValueError("OpenAI API key is not configured")

        logger.info("Starting GPT analysis")
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
        logger.info("Successfully completed GPT analysis")
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error in analyze_with_gpt: {str(e)}")
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
        logger.info(f"Received URL analysis request for: {request.url}")
        
        # Validate URL
        if not request.url.startswith(('http://', 'https://')):
            request.url = 'https://' + request.url
            logger.info(f"Added https:// prefix to URL: {request.url}")

        if 'linkedin.com' not in request.url:
            logger.error("Invalid URL: Not a LinkedIn URL")
            raise HTTPException(status_code=400, detail="Please provide a valid LinkedIn URL")

        # Fetch profile content
        logger.info("Fetching profile content")
        async with httpx.AsyncClient() as client:
            response = await client.get(request.url)
            if response.status_code != 200:
                logger.error(f"Failed to fetch profile. Status code: {response.status_code}")
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch LinkedIn profile")

        # Extract profile information
        profile_text = extract_profile_info(response.text)
        
        # Analyze with GPT
        summary = analyze_with_gpt(profile_text)

        logger.info("Successfully completed URL analysis")
        return {
            "success": True,
            "summary": summary
        }
    except Exception as e:
        logger.error(f"Error in analyze_url: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze_pdf")
async def analyze_pdf(file: UploadFile = File(...)):
    try:
        logger.info(f"Received PDF analysis request for file: {file.filename}")
        
        # Read PDF content
        content = await file.read()
        logger.info(f"Successfully read PDF file, size: {len(content)} bytes")
        
        # Extract text from PDF
        text_content = extract_text_from_pdf(content)
        
        # Analyze with GPT
        summary = analyze_with_gpt(text_content)

        logger.info("Successfully completed PDF analysis")
        return {
            "success": True,
            "summary": summary
        }
    except Exception as e:
        logger.error(f"Error in analyze_pdf: {str(e)}")
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