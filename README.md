# LinkedIngest

Turn any LinkedIn profile into an LLM-friendly summary for personalized outreach.

## Overview
LinkedIngest is a web-based tool that helps you create personalized outreach by converting LinkedIn profiles into digestible, AI-friendly summaries. Perfect for recruiters, job seekers, and networkers.

## Features
- LinkedIn profile data extraction and summarization
- LLM-friendly output generation
- Customizable tone and context settings
- Privacy-first design

## Tech Stack
- Frontend: Next.js (React)
- Backend: FastAPI (Python)
- Deployment: Replit
- Domain: linkedingest.com

## Local Development

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Environment Variables
Create a `.env` file in the backend directory with:
```
OPENAI_API_KEY=your_key_here
```

## License
MIT 