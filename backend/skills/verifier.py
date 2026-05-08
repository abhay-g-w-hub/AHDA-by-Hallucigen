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

def verify_claim(claim: str, evidence_list: list) -> dict:
    """
    Verify a claim against a list of evidence.
    Returns a dict with verdict, confidence, and explanation.
    """
    evidence_text = "\n\n".join([f"Source: {e['source']}\nText: {e['text']}" for e in evidence_list])
    
    if not setup_gemini():
        logger.warning("GEMINI_API_KEY not found. Using mock verifier.")
        return {
            "verdict": "UNVERIFIABLE",
            "confidence": 0.5,
            "explanation": "No API key configured to verify the claim."
        }

    if not evidence_list:
        return {
            "verdict": "UNVERIFIABLE",
            "confidence": 0.0,
            "explanation": "No evidence could be retrieved to verify this claim."
        }

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        You are an expert fact-checker. Evaluate the following claim based ONLY on the provided evidence.
        
        Claim: "{claim}"
        
        Evidence:
        {evidence_text}
        
        Respond with ONLY a valid JSON object with the following structure:
        {{
            "verdict": "TRUE" | "FALSE" | "UNVERIFIABLE",
            "confidence": <float between 0.0 and 1.0>,
            "explanation": "<brief 1-2 sentence explanation of your reasoning based on the evidence>"
        }}
        Do not include markdown backticks or any other text.
        """
        response = model.generate_content(prompt)
        text_resp = response.text.strip()
        
        if text_resp.startswith('```json'):
            text_resp = text_resp[7:-3]
        elif text_resp.startswith('```'):
            text_resp = text_resp[3:-3]
            
        result = json.loads(text_resp)
        return result
    except Exception as e:
        logger.error(f"Error in verify_claim: {e}")
        return {
            "verdict": "UNVERIFIABLE",
            "confidence": 0.0,
            "explanation": f"Verification failed due to an internal error: {str(e)}"
        }
