# LinkedIngest

Turn any LinkedIn profile into an LLM-friendly summary for personalized outreach.

## Overview

LinkedIngest is a web-based tool that streamlines professional networking by generating AI-powered summaries of LinkedIn profiles. Simply input a LinkedIn profile URL or PDF export, and get a concise, LLM-friendly summary perfect for crafting personalized outreach messages.

## Features

- Profile data extraction from URLs or PDF exports
- AI-powered summarization
- Customizable tone and context
- LLM-friendly output format
- Privacy-first design

## Tech Stack

- Frontend: React.js
- Backend: FastAPI (Python)
- AI: OpenAI GPT for summarization
- Database: SQLite (for MVP)

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Development Status

🚧 Currently in active development 🚧

## License

MIT License 