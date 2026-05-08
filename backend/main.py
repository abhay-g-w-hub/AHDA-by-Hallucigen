from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from database import init_db, log_conversation
from openclaw_bridge import run_verification

app = FastAPI(title="AHDA Prototype API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VerificationRequest(BaseModel):
    text: str
    session_id: Optional[str] = None

class Evidence(BaseModel):
    source: str
    text: str

class ClaimResult(BaseModel):
    claim: str
    verdict: str
    confidence: float
    explanation: str
    evidence: List[Evidence]

class VerificationResponse(BaseModel):
    status: str
    overall_confidence: float
    claims: List[ClaimResult]

@app.on_event("startup")
def startup_event():
    init_db()

@app.post("/api/verify", response_model=VerificationResponse)
async def verify_text(request: VerificationRequest):
    session_id = request.session_id or str(uuid.uuid4())
    log_conversation(session_id, request.text)
    
    try:
        # Call the OpenClaw orchestration bridge
        result = await run_verification(request.text, session_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
