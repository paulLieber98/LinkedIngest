import requests
from bs4 import BeautifulSoup
import PyPDF2
import io
import openai
from typing import Optional, Dict
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
                max_tokens=500,
                temperature=0.7,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )
            return response.choices[0].text.strip()
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

        # Common LinkedIn section headers
        section_markers = {
            "about": ["about", "summary"],
            "experience": ["experience", "work experience", "employment"],
            "education": ["education", "academic background"],
            "skills": ["skills", "skills & endorsements", "skills and endorsements"],
            "certifications": ["licenses & certifications", "certifications"],
            "languages": ["languages"]
        }

        # Extract name (usually at the top)
        for line in lines[:5]:  # Check first 5 lines for name
            if line.strip() and not any(marker in line.lower() for markers in section_markers.values() for marker in markers):
                sections["name"] = line.strip()
                break

        # Process rest of the text
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
                        sections[current_section] = "\n".join(section_content)
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
                sections["headline"] = line

        # Save the last section
        if current_section and section_content:
            sections[current_section] = "\n".join(section_content)

        return sections

    def _create_summary_prompt(self, profile_data: Dict[str, str], tone: str, context: Optional[str] = None) -> str:
        """Create a detailed prompt for the GPT model"""
        prompt = f"Create a {tone} summary of the following LinkedIn profile. Focus on creating a natural, engaging narrative:\n\n"
        
        # Add sections in a specific order
        section_order = ["name", "headline", "about", "experience", "education", "skills", "certifications", "languages"]
        for key in section_order:
            if key in profile_data and profile_data[key].strip():
                prompt += f"{key.replace('_', ' ').title()}:\n{profile_data[key].strip()}\n\n"

        if context:
            prompt += f"\nContext for personalization: {context}\n"

        prompt += "\nPlease create a concise, engaging summary that:\n"
        prompt += "1. Starts with a strong introduction including the person's name and key role\n"
        prompt += "2. Highlights their most impressive achievements and experience\n"
        prompt += "3. Includes relevant skills and qualifications\n"
        prompt += f"4. Uses a {tone} tone throughout\n"
        prompt += "5. Ends with their unique value proposition or specialization\n"
        prompt += "6. Formats the text in 2-3 clear, readable paragraphs\n"

        return prompt 