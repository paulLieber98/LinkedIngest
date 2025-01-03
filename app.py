from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
from dotenv import load_dotenv
from openai import OpenAI
import requests
from bs4 import BeautifulSoup
from PyPDF2 import PdfReader
from werkzeug.utils import secure_filename
import tempfile

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def extract_profile_info(url):
    try:
        # For now, we'll just extract the username from the URL
        # In a production environment, you'd want to properly scrape or use LinkedIn's API
        username = url.split('/in/')[-1].strip('/')
        return username
    except Exception as e:
        return None

def extract_text_from_pdf(pdf_file):
    try:
        # Create a temporary file to store the uploaded PDF
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            pdf_file.save(temp_file.name)
            
            # Read PDF content
            reader = PdfReader(temp_file.name)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            
            # Clean up the temporary file
            os.unlink(temp_file.name)
            
            if not text.strip():
                raise Exception("No text could be extracted from the PDF")
            
            return text
    except Exception as e:
        raise Exception(f"Error processing PDF: {str(e)}")

def generate_summary(profile_info, is_pdf=False):
    try:
        # Craft different prompts based on input type
        if is_pdf:
            prompt = """Please analyze this LinkedIn profile content and create a summary in the following JSON format:
{
    "name": "Full Name",
    "current_role": "Current Job Title",
    "company": "Current Company",
    "summary": "Brief professional summary",
    "chatbot_prompt": "A conversational summary starting with 'This is [Name]'s LinkedIn profile summary:'"
}

Profile Content:
""" + profile_info

        else:
            prompt = f"""Analyze this LinkedIn profile username: {profile_info}
            Create a professional summary in the following JSON format:
            {{
                "name": "Name based on username",
                "current_role": "Likely current role",
                "company": "Likely company",
                "summary": "Brief professional summary",
                "chatbot_prompt": "A conversational summary"
            }}"""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional LinkedIn profile analyzer. Create concise, accurate summaries in valid JSON format with all the required fields. Always include a chatbot_prompt field that starts with 'This is [Name]'s LinkedIn profile summary:'"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )

        # Extract the response content and ensure it's valid JSON
        summary = response.choices[0].message.content.strip()
        
        try:
            import json
            # Try to parse the entire response as JSON
            result = json.loads(summary)
            
            # Ensure all required fields are present
            required_fields = ['name', 'current_role', 'company', 'summary', 'chatbot_prompt']
            for field in required_fields:
                if field not in result:
                    result[field] = "Not specified"
                    
            # Ensure chatbot_prompt starts with the required format
            if not result['chatbot_prompt'].startswith("This is"):
                result['chatbot_prompt'] = f"This is {result['name']}'s LinkedIn profile summary: {result['chatbot_prompt']}"
                
            return result
            
        except json.JSONDecodeError as e:
            # If JSON parsing fails, create a structured response
            return {
                "name": "Unknown",
                "current_role": "Professional",
                "company": "Unknown",
                "summary": summary,
                "chatbot_prompt": f"This is a LinkedIn profile summary: {summary}"
            }

    except Exception as e:
        print(f"Error in generate_summary: {str(e)}")  # Add debugging
        return {
            "error": str(e)
        }

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_profile():
    data = request.json
    profile_url = data.get('url')
    
    if not profile_url:
        return jsonify({'error': 'No URL provided'}), 400
    
    try:
        # Extract profile information
        profile_info = extract_profile_info(profile_url)
        if not profile_info:
            return jsonify({'error': 'Could not extract profile information'}), 400

        # Generate summary using OpenAI
        summary = generate_summary(profile_info)
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-pdf', methods=['POST'])
def analyze_pdf():
    if 'pdf' not in request.files:
        return jsonify({'error': 'No PDF file provided'}), 400
    
    pdf_file = request.files['pdf']
    if pdf_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not pdf_file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'File must be a PDF'}), 400
    
    try:
        # Extract text from PDF
        profile_text = extract_text_from_pdf(pdf_file)
        if not profile_text:
            return jsonify({'error': 'Could not extract text from PDF'}), 400

        # Generate summary using OpenAI
        summary = generate_summary(profile_text, is_pdf=True)
        
        # Check if there was an error
        if 'error' in summary:
            return jsonify({'error': summary['error']}), 500
            
        return jsonify(summary)
    except Exception as e:
        print(f"Error in analyze_pdf: {str(e)}")  # Add debugging
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 3000))) 