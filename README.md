# LinkedIngest

Turn any LinkedIn profile into an LLM-friendly summary for personalized outreach.

## Features

- **URL Analysis**: Extract insights from LinkedIn profile URLs
- **PDF Upload**: Process exported LinkedIn profile PDFs
- **Chatbot-Ready Summaries**: Get AI-generated summaries ready for use with ChatGPT or other LLMs
- **One-Click Copy**: Easy copying of both structured and conversational summaries

## Setup

1. Clone the repository:
```bash
git clone https://github.com/paulLieber98/LinkedIngest.git
```

2. Create a virtual environment and install dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Create a `.env` file with your OpenAI API key:
```
OPENAI_API_KEY=your_key_here
PORT=3000
```

4. Run the application:
```bash
python app.py
```

5. Visit `http://localhost:3000` in your browser

## Usage

1. Choose between URL analysis or PDF upload
2. Enter a LinkedIn profile URL or upload a LinkedIn profile PDF
3. Get an AI-generated summary in both structured and chatbot-friendly formats
4. Use the "Copy" buttons to easily paste summaries into your favorite LLM

## Technology Stack

- Flask (Python web framework)
- OpenAI GPT-3.5
- TailwindCSS
- PyPDF2 for PDF processing 