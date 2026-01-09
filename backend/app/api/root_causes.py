from fastapi import APIRouter
from typing import Dict, Any
import json

from app.api.analyze import GLOBAL_ANALYSIS

router = APIRouter()

@router.post("/root_causes")
def get_root_causes() -> Dict[str, Any]:
    """
    Return derived root causes from the latest analysis.
    """

    if not GLOBAL_ANALYSIS:
        return {"root_causes": []}

    raw_summary = GLOBAL_ANALYSIS.get("analysis_summary")

    summary = {}

    # 🔥 Parse summary if it's a JSON string
    if isinstance(raw_summary, str):
        try:
            cleaned = raw_summary.replace("```json", "").replace("```", "").strip()
            summary = json.loads(cleaned)
        except Exception as e:
            print("Failed to parse analysis_summary:", e)
            summary = {}
    elif isinstance(raw_summary, dict):
        summary = raw_summary

    dominant = summary.get("dominant_reasons", [])

    root_causes = [
        {
            "reason": r,
            "confidence": "high",
            "status": "open",
        }
        for r in dominant
    ]

    return {"root_causes": root_causes}
