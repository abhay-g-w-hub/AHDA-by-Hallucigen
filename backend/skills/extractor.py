import google.generativeai as genai
import os
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
        return True
    return False

def extract_claims(text: str) -> list:
    """
    Extract factual claims from a block of text.
    Returns a list of string claims.
    """
    if not setup_gemini():
        logger.warning("GEMINI_API_KEY not found. Using mock extractor.")
        # Simple mock extraction by splitting sentences roughly
        return [c.strip() for c in text.split('.') if len(c.strip()) > 5]

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        Analyze the following text and extract all verifiable factual claims.
        Break down complex sentences into individual atomic claims.
        Return ONLY a valid JSON array of strings. Do not include markdown formatting or backticks.
        
        Text:
        {text}
        """
        response = model.generate_content(prompt)
        text_resp = response.text.strip()
        if text_resp.startswith('```json'):
            text_resp = text_resp[7:-3]
        elif text_resp.startswith('```'):
            text_resp = text_resp[3:-3]
            
        claims = json.loads(text_resp)
        return claims
    except Exception as e:
        logger.error(f"Error in extract_claims: {e}")
        return [text]
