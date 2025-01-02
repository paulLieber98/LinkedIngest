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

# Configure logging with more detail
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Initialize OpenAI client with error handling
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    logger.error("OPENAI_API_KEY environment variable is not set")
    raise ValueError("OpenAI API key is not configured")

# Configure OpenAI client
openai.api_key = api_key

# Add more detailed logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    logger.info(f"Headers: {request.headers}")
    try:
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request failed: {str(e)}")
        raise

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.error(f"HTTP Exception: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": str(exc.detail)},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"General Exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

class URLAnalysisRequest(BaseModel):
    url: str
    context: Optional[str] = None

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

def analyze_with_gpt(profile_text, context=None):
    try:
        logger.info("Starting GPT analysis")
        
        # Base system message
        system_message = """You are an expert at analyzing LinkedIn profiles and creating concise, informative summaries. 
        Focus on extracting and highlighting key professional details including:
        - Current role and company
        - Key skills and expertise
        - Professional experience highlights
        - Educational background
        - Notable achievements
        
        Format the summary in a clear, bullet-point style that's easy to read and understand.
        Be direct and professional in your analysis."""

        # Add context if provided
        if context:
            system_message += f"\n\nAdditional context for analysis: {context}"

        # Log the API key status (safely)
        logger.info(f"OpenAI API Key configured: {bool(openai.api_key)}")
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": system_message
                    },
                    {
                        "role": "user",
                        "content": f"Please analyze this LinkedIn profile content and create a professional summary:\n\n{profile_text}"
                    }
                ],
                temperature=0.7,
                max_tokens=1500,
                presence_penalty=0.6,
                frequency_penalty=0.3
            )
            
            if not response or not response.choices or not response.choices[0].message:
                raise ValueError("Invalid response from OpenAI API")
                
            logger.info("Successfully completed GPT analysis")
            return response.choices[0].message.content
            
        except openai.error.AuthenticationError as e:
            logger.error(f"OpenAI Authentication Error: {str(e)}")
            raise HTTPException(status_code=500, detail="API authentication failed. Please check the configuration.")
        except openai.error.RateLimitError as e:
            logger.error(f"OpenAI Rate Limit Error: {str(e)}")
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again in a moment.")
        except openai.error.InvalidRequestError as e:
            logger.error(f"OpenAI Invalid Request Error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error(f"OpenAI API Error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error in GPT analysis: {str(e)}")
            
    except Exception as e:
        logger.error(f"Error in analyze_with_gpt: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
@app.get("/api")
async def root():
    """Root endpoint that handles both / and /api"""
    response = JSONResponse(
        content={
            "message": "LinkedIngest API is running",
            "version": "1.0.0",
            "status": "healthy",
            "timestamp": datetime.now().isoformat()
        },
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            "Content-Type": "application/json"
        }
    )
    return response

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check if OpenAI API key is configured
        if not openai.api_key:
            return JSONResponse(
                status_code=500,
                content={
                    "status": "unhealthy",
                    "timestamp": datetime.now().isoformat(),
                    "api_version": "1.0.0",
                    "openai_api": "not configured",
                    "environment": os.getenv("VERCEL_ENV", "development"),
                    "error": "OpenAI API key is not configured"
                }
            )
        
        # Test OpenAI API key with a simple request
        try:
            # Make a simple test request
            openai.Model.list()
            api_key_status = "valid"
        except openai.error.AuthenticationError:
            api_key_status = "invalid"
        except Exception as e:
            logger.error(f"Error testing OpenAI API key: {str(e)}")
            api_key_status = "error"
        
        return JSONResponse(
            content={
                "status": "healthy" if api_key_status == "valid" else "unhealthy",
                "timestamp": datetime.now().isoformat(),
                "api_version": "1.0.0",
                "openai_api": api_key_status,
                "environment": os.getenv("VERCEL_ENV", "development")
            },
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
                "Content-Type": "application/json"
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "unhealthy",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
        )

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
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
        }
        
        timeout = httpx.Timeout(30.0, connect=20.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(request.url, headers=headers, follow_redirects=True)
            if response.status_code == 999:
                raise HTTPException(status_code=403, detail="LinkedIn has blocked the request. Please try uploading a PDF instead.")
            if response.status_code != 200:
                logger.error(f"Failed to fetch profile. Status code: {response.status_code}")
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch LinkedIn profile")

        # Extract profile information
        profile_text = extract_profile_info(response.text)
        
        if not profile_text or len(profile_text.strip()) < 10:
            raise HTTPException(status_code=400, detail="Could not extract profile information. Please ensure the URL is accessible and try again.")
        
        # Analyze with GPT
        summary = analyze_with_gpt(profile_text, request.context)

        logger.info("Successfully completed URL analysis")
        return JSONResponse(
            content={
                "success": True,
                "summary": summary
            },
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "*",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in analyze_url: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze_pdf")
async def analyze_pdf(
    file: UploadFile = File(...),
    context: Optional[str] = Form(None)
):
    try:
        logger.info(f"Received PDF analysis request for file: {file.filename}")
        
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Please upload a PDF file")
        
        # Read PDF content with size limit
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(status_code=413, detail="PDF file too large. Maximum size is 10MB.")
        
        logger.info(f"Successfully read PDF file, size: {len(content)} bytes")
        
        # Extract text from PDF
        text_content = extract_text_from_pdf(content)
        
        if not text_content or len(text_content.strip()) < 10:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF. Please ensure it's a valid PDF with text content.")
        
        # Analyze with GPT
        summary = analyze_with_gpt(text_content, context)

        logger.info("Successfully completed PDF analysis")
        return JSONResponse(
            content={
                "success": True,
                "summary": summary
            },
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "*",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )
    except HTTPException as he:
        raise he
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