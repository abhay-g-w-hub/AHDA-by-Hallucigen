import subprocess
import json
import logging
from typing import List, Dict

from database import log_hallucination
from skills.extractor import extract_claims
from skills.retriever import retrieve_evidence
from skills.verifier import verify_claim

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

OPENCLAW_PATH = "/home/abc/.nvm/versions/node/v24.15.0/bin/openclaw"

async def execute_openclaw_cli(text: str) -> dict:
    """
    Attempt to run the isolated OpenClaw binary via WSL.
    """
    cmd = ["wsl", OPENCLAW_PATH, "run", "--task", f"Verify the following text and extract claims, retrieve evidence, and verify. Output JSON only. Text: {text}", "--json"]
    try:
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, stderr = process.communicate(timeout=30)
        
        if process.returncode == 0:
            return json.loads(stdout)
        else:
            logger.warning(f"OpenClaw CLI failed with code {process.returncode}: {stderr}")
            return None
    except Exception as e:
        logger.warning(f"Failed to execute OpenClaw via WSL: {e}")
        return None

async def run_verification(text: str, session_id: str) -> dict:
    """
    The main OpenClaw-style Pi Engine Agent Loop.
    Attempts to use the isolated OpenClaw binary. If it fails or is unavailable,
    it falls back to the native Python OpenClaw-style skills workflow.
    """
    
    # 1. Try native OpenClaw binary
    logger.info("Attempting execution via isolated OpenClaw WSL binary...")
    cli_result = await execute_openclaw_cli(text)
    if cli_result and "claims" in cli_result:
        return cli_result

    # 2. Fallback to OpenClaw-style Python orchestration (Pi Engine Loop)
    logger.info("Falling back to Python OpenClaw-style native orchestration...")
    
    # Step 1: Think & Extract
    logger.info("Agent State: EXTRACTING CLAIMS")
    claims = extract_claims(text)
    
    results = []
    total_confidence = 0.0
    
    # Step 2: Act (Retrieve & Verify Loop)
    for claim in claims:
        logger.info(f"Agent State: RETRIEVING EVIDENCE FOR -> {claim}")
        evidence = retrieve_evidence(claim)
        
        logger.info(f"Agent State: VERIFYING -> {claim}")
        verification = verify_claim(claim, evidence)
        
        # Step 3: Critique / Log Memory
        if verification.get("verdict") == "FALSE":
            log_hallucination(
                session_id=session_id,
                claim=claim,
                evidence=json.dumps(evidence),
                confidence=verification.get("confidence", 0.0),
                explanation=verification.get("explanation", "")
            )
            
        result_obj = {
            "claim": claim,
            "verdict": verification.get("verdict", "UNVERIFIABLE"),
            "confidence": verification.get("confidence", 0.0),
            "explanation": verification.get("explanation", "No explanation provided."),
            "evidence": evidence
        }
        results.append(result_obj)
        total_confidence += verification.get("confidence", 0.0)

    overall_conf = total_confidence / len(results) if results else 0.0

    return {
        "status": "completed",
        "overall_confidence": overall_conf,
        "claims": results
    }
