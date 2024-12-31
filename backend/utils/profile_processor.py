import requests
from bs4 import BeautifulSoup
import PyPDF2
import io
import openai
from typing import Optional, Dict

class ProfileProcessor:
    def __init__(self, openai_api_key: str):
        self.openai_api_key = openai_api_key
        openai.api_key = openai_api_key

    def extract_from_url(self, url: str) -> Dict[str, str]:
        """
        Extract information from a LinkedIn profile URL
        Note: This is a placeholder. LinkedIn's robots.txt prohibits scraping.
        In production, you'd need to use LinkedIn's API or handle user-provided data.
        """
        # TODO: Implement proper LinkedIn API integration
        return {
            "name": "Sample Name",
            "title": "Sample Title",
            "company": "Sample Company",
            "about": "Sample About Section"
        }

    def extract_from_pdf(self, pdf_content: bytes) -> Dict[str, str]:
        """Extract information from a PDF file of a LinkedIn profile"""
        try:
            pdf_file = io.BytesIO(pdf_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text_content = ""
            for page in pdf_reader.pages:
                text_content += page.extract_text()

            # Basic extraction - can be enhanced with regex patterns
            return {
                "raw_text": text_content,
                "extracted_text": self._clean_text(text_content)
            }
        except Exception as e:
            raise Exception(f"Error processing PDF: {str(e)}")

    def generate_summary(self, profile_data: Dict[str, str], tone: str = "professional", context: Optional[str] = None) -> str:
        """Generate a summary using OpenAI's GPT"""
        prompt = self._create_summary_prompt(profile_data, tone, context)
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional profile summarizer. Create concise, relevant summaries for networking purposes."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Error generating summary: {str(e)}")

    def _clean_text(self, text: str) -> str:
        """Clean and format extracted text"""
        # Remove extra whitespace and normalize line endings
        cleaned = " ".join(text.split())
        return cleaned

    def _create_summary_prompt(self, profile_data: Dict[str, str], tone: str, context: Optional[str]) -> str:
        """Create a prompt for the GPT model"""
        base_prompt = f"Create a {tone} summary of the following LinkedIn profile for networking purposes:\n\n"
        
        for key, value in profile_data.items():
            base_prompt += f"{key}: {value}\n"

        if context:
            base_prompt += f"\nContext for summary: {context}"

        base_prompt += "\n\nProvide a concise summary that highlights key points and would be useful for personalized outreach."
        return base_prompt 