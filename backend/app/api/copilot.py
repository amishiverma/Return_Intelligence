from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any

from app.api.analyze import GLOBAL_ANALYSIS
from app.services.openai_service import copilot_response

router = APIRouter()

class CopilotRequest(BaseModel):
    question: str

@router.post("/copilot")
def copilot(req: CopilotRequest) -> Dict[str, Any]:
    if not GLOBAL_ANALYSIS:
        return {
            "answer": "No analysis data available yet. Please upload return data first."
        }

    context = {
        "analysis_summary": GLOBAL_ANALYSIS.get("analysis_summary", {}),
        "language_signals": GLOBAL_ANALYSIS.get("language_signals", {}),
        "total_returns": GLOBAL_ANALYSIS.get("total_returns", 0),
    }

    answer = copilot_response(req.question, context)

    return {
        "answer": answer
    }
