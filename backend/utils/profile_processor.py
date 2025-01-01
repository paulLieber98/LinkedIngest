import requests
from bs4 import BeautifulSoup
import PyPDF2
import io
import openai
from typing import Optional, Dict, List
import re
from urllib.parse import urlparse

class ProfileProcessor:
    def __init__(self, openai_api_key: str):
        self.openai_api_key = openai_api_key
        openai.api_key = openai_api_key

    def extract_from_url(self, url: str) -> Dict[str, str]:
        """Extract information from a LinkedIn profile URL"""
        # Validate LinkedIn URL
        if not self._is_valid_linkedin_url(url):
            raise ValueError("Invalid LinkedIn URL. Please provide a valid LinkedIn profile URL.")

        try:
            # Note: Due to LinkedIn's restrictions, we'll use a simulated response
            # In production, you would use LinkedIn's API or handle user-provided data
            profile_data = self._simulate_linkedin_data(url)
            return profile_data
        except Exception as e:
            raise Exception(f"Error extracting profile data: {str(e)}")

    def extract_from_pdf(self, pdf_content: bytes) -> Dict[str, str]:
        """Extract information from a PDF file of a LinkedIn profile"""
        try:
            pdf_file = io.BytesIO(pdf_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            # Extract all text from PDF
            full_text = ""
            for page in pdf_reader.pages:
                full_text += page.extract_text() + "\n"

            # Process the text to extract relevant sections
            sections = self._extract_profile_sections(full_text)
            
            # Clean up the extracted data
            cleaned_sections = {}
            for key, value in sections.items():
                if value:
                    # Remove extra whitespace and normalize line endings
                    cleaned_value = "\n".join(line.strip() for line in value.split("\n") if line.strip())
                    cleaned_sections[key] = cleaned_value

            return cleaned_sections
        except Exception as e:
            raise Exception(f"Error processing PDF: {str(e)}")

    def generate_summary(self, profile_data: Dict[str, str], tone: str = "professional", context: Optional[str] = None) -> str:
        """Generate a summary using OpenAI's GPT"""
        prompt = self._create_summary_prompt(profile_data, tone, context)
        
        try:
            response = openai.Completion.create(
                model="gpt-3.5-turbo-instruct",
                prompt=prompt,
                max_tokens=800,  # Increased for more detailed summaries
                temperature=0.7,
                top_p=1.0,
                frequency_penalty=0.3,  # Increased for more diverse language
                presence_penalty=0.2,   # Increased to avoid repetition
            )
            
            # Post-process the summary to ensure consistent formatting
            summary = response.choices[0].text.strip()
            
            # Ensure each section starts on a new line
            sections = ["PROFESSIONAL IDENTITY:", "CORE EXPERTISE:", "EXPERIENCE HIGHLIGHTS:", 
                       "TECHNICAL SKILLS:", "EDUCATION:", "NOTABLE ACHIEVEMENTS:"]
            for section in sections:
                if section in summary and not summary.startswith(section):
                    summary = summary.replace(section, f"\n{section}")
            
            return summary
        except Exception as e:
            raise Exception(f"Error generating summary: {str(e)}")

    def _is_valid_linkedin_url(self, url: str) -> bool:
        """Validate if the URL is a LinkedIn profile URL"""
        try:
            parsed = urlparse(url)
            return (
                parsed.netloc in ['www.linkedin.com', 'linkedin.com'] and
                '/in/' in parsed.path
            )
        except:
            return False

    def _simulate_linkedin_data(self, url: str) -> Dict[str, str]:
        """Simulate LinkedIn profile data extraction"""
        # Extract username from URL
        username = url.split('/in/')[-1].split('/')[0]
        
        # In production, this would be replaced with actual LinkedIn API calls
        return {
            "name": f"{username.replace('-', ' ').title()}",
            "headline": "Technology Professional",
            "current_position": "Senior Software Engineer at Tech Corp",
            "experience": """
                - Led development of cloud-native applications
                - Managed team of 5 engineers
                - Implemented CI/CD pipelines
                - Reduced deployment time by 60%
            """,
            "education": "Master's in Computer Science",
            "skills": """
                Python, JavaScript, Cloud Computing,
                System Design, Team Leadership
            """,
            "about": """
                Passionate technologist with 8+ years of experience in software development.
                Focused on creating scalable solutions and mentoring junior developers.
            """
        }

    def _extract_profile_sections(self, text: str) -> Dict[str, str]:
        """Extract structured information from PDF text"""
        sections = {
            "name": "",
            "headline": "",
            "about": "",
            "experience": "",
            "education": "",
            "skills": "",
            "certifications": "",
            "languages": ""
        }

        # Split text into lines for processing
        lines = text.split('\n')
        current_section = ""
        section_content = []

        # Common LinkedIn section headers and their variations
        section_markers = {
            "about": ["about", "summary", "professional summary", "overview"],
            "experience": ["experience", "work experience", "employment history", "professional experience"],
            "education": ["education", "academic background", "academic history"],
            "skills": ["skills", "skills & endorsements", "skills and endorsements", "expertise"],
            "certifications": ["licenses & certifications", "certifications", "professional certifications"],
            "languages": ["languages", "language proficiency"]
        }

        # Extract name (usually at the top)
        for line in lines[:5]:
            line = line.strip()
            if line and not any(marker in line.lower() for markers in section_markers.values() for marker in markers):
                sections["name"] = line
                break

        # Process rest of the text with improved section detection
        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Check if this line is a section header
            lower_line = line.lower()
            found_section = False
            for section, markers in section_markers.items():
                if any(marker in lower_line for marker in markers):
                    # Save previous section content
                    if current_section and section_content:
                        sections[current_section] = self._clean_section_content(section_content)
                    # Start new section
                    current_section = section
                    section_content = []
                    found_section = True
                    break

            # If not a section header, add to current section
            if not found_section and current_section:
                section_content.append(line)

            # Try to extract headline if not found yet
            if not sections["headline"] and not current_section and line != sections["name"]:
                if len(line.split()) <= 15:  # Reasonable length for a headline
                    sections["headline"] = line

        # Save the last section
        if current_section and section_content:
            sections[current_section] = self._clean_section_content(section_content)

        return sections

    def _clean_section_content(self, content: List[str]) -> str:
        """Clean and format section content for better processing"""
        # Join lines and clean up whitespace
        text = ' '.join(content)
        
        # Remove multiple spaces
        text = ' '.join(text.split())
        
        # Add bullet points for better structure in experience sections
        if any(keyword in text.lower() for keyword in ['achieved', 'developed', 'led', 'managed', 'created']):
            sentences = text.split('. ')
            text = '\n• ' + '\n• '.join(s.strip() for s in sentences if s.strip())
        
        return text.strip()

    def _create_summary_prompt(self, profile_data: Dict[str, str], tone: str, context: Optional[str] = None) -> str:
        """Create a detailed prompt for the GPT model"""
        prompt = f"""Generate a concise, well-structured summary of this LinkedIn profile that would be ideal for use as context in LLM/chatbot conversations. Use a {tone} tone.

Profile Information:
{'-' * 40}"""
        
        # Add sections in a specific order with clear formatting
        section_order = ["name", "headline", "about", "experience", "education", "skills", "certifications", "languages"]
        for key in section_order:
            if key in profile_data and profile_data[key].strip():
                prompt += f"\n{key.upper()}:\n{profile_data[key].strip()}\n"

        if context:
            prompt += f"\nADDITIONAL CONTEXT:\n{context}\n"

        prompt += f"""
{'-' * 40}

Create a summary that:
1. Starts with a clear, one-sentence professional identity statement
2. Follows a structured format with clear sections
3. Emphasizes key achievements and skills relevant for AI processing
4. Uses clear, unambiguous language
5. Includes specific numbers and metrics where available
6. Maintains factual accuracy without embellishment
7. Formats information in a way that's easy for LLMs to parse

Format the summary in this structure:
PROFESSIONAL IDENTITY: [One-sentence overview]
CORE EXPERTISE: [Key areas of expertise, comma-separated]
EXPERIENCE HIGHLIGHTS: [Bullet points of key achievements]
TECHNICAL SKILLS: [Relevant technical skills, comma-separated]
EDUCATION: [Relevant degrees and certifications]
NOTABLE ACHIEVEMENTS: [Key metrics and accomplishments]

Keep the tone {tone} while maintaining clarity and factual accuracy."""

        return prompt 