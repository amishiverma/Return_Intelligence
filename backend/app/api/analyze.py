from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
import json
from app.services.openai_service import analyze_returns
from app.services.language_service import extract_language_signals

router = APIRouter()

# ====== In-memory store (demo-safe) ======
GLOBAL_ANALYSIS: Dict[str, Any] = {}

class AnalyzeRequest(BaseModel):
    returns: List[Dict[str, Any]]

@router.post("/analyze")
def analyze(req: AnalyzeRequest):
    """
    1. Extract language signals using Azure AI Language
    2. Generate high-level analysis using Azure OpenAI
    3. Store result for Copilot + Dashboard
    """

    # Collect free-text reasons for language analysis
    texts = [
        r.get("reason", "")
        for r in req.returns
        if r.get("reason")
    ]

    language_signals = extract_language_signals(texts)

    analysis_summary = analyze_returns(req.returns)

    cleaned = analysis_summary["summary"].replace("```json", "").replace("```", "").strip()

    GLOBAL_ANALYSIS.clear()
    GLOBAL_ANALYSIS.update({
        "language_signals": language_signals,
        "analysis_summary": analysis_summary["summary"],
        "total_returns": len(req.returns)
    })

    return {
        "status": "ok",
        "analysis": GLOBAL_ANALYSIS
    }
