from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
from dotenv import load_dotenv
from openai import OpenAI
import PyPDF2
import io

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def generate_summary(profile_info):
    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that creates concise, professional summaries of LinkedIn profiles."},
                {"role": "user", "content": f"Create a professional summary of this LinkedIn profile information, followed by a chatbot-friendly version that can be used as a prompt: {profile_info}"}
            ]
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        return None

def extract_profile_info(url):
    # For now, just return the username from the URL
    # In a full implementation, this would scrape the actual profile data
    try:
        username = url.split('/in/')[-1].strip('/')
        return f"LinkedIn profile for user: {username}"
    except:
        return None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_profile():
    data = request.get_json()
    url = data.get('url')
    
    if not url:
        return jsonify({'error': 'No URL provided'}), 400
    
    profile_info = extract_profile_info(url)
    if not profile_info:
        return jsonify({'error': 'Could not extract profile information'}), 400
    
    summary = generate_summary(profile_info)
    if not summary:
        return jsonify({'error': 'Could not generate summary'}), 500
    
    # Parse the summary to extract structured information
    # This is a simple implementation - you might want to make this more robust
    lines = summary.split('\n')
    response = {
        'name': 'Unknown',
        'current_role': 'Unknown',
        'company': 'Unknown',
        'summary': summary
    }
    
    for line in lines:
        if 'Name:' in line:
            response['name'] = line.split('Name:')[-1].strip()
        elif 'Current Role:' in line:
            response['current_role'] = line.split('Current Role:')[-1].strip()
        elif 'Company:' in line:
            response['company'] = line.split('Company:')[-1].strip()
    
    return jsonify(response)

@app.route('/api/analyze-pdf', methods=['POST'])
def analyze_pdf():
    if 'pdf' not in request.files:
        return jsonify({'error': 'No PDF file provided'}), 400
    
    pdf_file = request.files['pdf']
    if pdf_file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        # Read PDF content
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file.read()))
        text_content = ""
        for page in pdf_reader.pages:
            text_content += page.extract_text()
        
        # Generate summary using OpenAI
        summary = generate_summary(text_content)
        if not summary:
            return jsonify({'error': 'Could not generate summary'}), 500
        
        # Parse the summary to extract structured information
        lines = summary.split('\n')
        response = {
            'name': 'Unknown',
            'current_role': 'Unknown',
            'company': 'Unknown',
            'summary': summary
        }
        
        for line in lines:
            if 'Name:' in line:
                response['name'] = line.split('Name:')[-1].strip()
            elif 'Current Role:' in line:
                response['current_role'] = line.split('Current Role:')[-1].strip()
            elif 'Company:' in line:
                response['company'] = line.split('Company:')[-1].strip()
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': f'Error processing PDF: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 3000))) 