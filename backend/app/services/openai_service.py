import os
from typing import List, Dict, Any
from openai import AzureOpenAI
from dotenv import load_dotenv
load_dotenv()

# =========================
# Azure OpenAI Client
# =========================
AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION")
DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")

client = AzureOpenAI(
    api_key=AZURE_API_KEY,
    azure_endpoint=AZURE_ENDPOINT,
    api_version=AZURE_API_VERSION,
)

# ======================================================
# ANALYZE RETURNS (used by /analyze)
# ======================================================
def analyze_returns(returns: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    High-level aggregation + signal extraction.
    This feeds dashboard + copilot context.
    """

    prompt = f"""
You are an AI system analyzing e-commerce return data.

Your task:
- detect major return patterns
- extract high-level insights
- summarize key signals for downstream reasoning

Return JSON with:
- total_returns
- top_skus
- dominant_reasons
- confidence (low/medium/high)

DATA:
{returns}
"""

    response = client.chat.completions.create(
        model=DEPLOYMENT,
        messages=[
            {"role": "system", "content": "You analyze return datasets."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=400,
    )

    return {
        "summary": response.choices[0].message.content.strip()
    }


# ======================================================
# GENERATE ROOT CAUSES (used by /root-causes)
# ======================================================
def generate_root_causes(returns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Converts raw returns into structured root causes
    """

    prompt = f"""
You are an AI specialized in root cause analysis.

From the return data below:
- group related issues
- assign root causes
- include confidence and impact

Return JSON array with:
- id
- title
- description
- affected_skus
- confidence (0-1)
- priority (high/medium/low)

DATA:
{returns}
"""

    response = client.chat.completions.create(
        model=DEPLOYMENT,
        messages=[
            {"role": "system", "content": "You perform root cause analysis."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.25,
        max_tokens=700,
    )

    return [
        {
            "raw": response.choices[0].message.content.strip()
        }
    ]


# ======================================================
# COPILOT RESPONSE (used by /copilot)
# ======================================================
def copilot_response(question: str, context: Dict[str, Any]) -> str:
    """
    Conversational Copilot grounded in analysis + root causes
    """

    system_prompt = """
You are an AI Copilot for a Return Intelligence platform.

Rules:
- Answer ONLY using provided data
- Be concise, analytical, business-friendly
- Prioritize actionable recommendations
- Avoid hallucination
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {
            "role": "user",
            "content": f"""
QUESTION:
{question}

CONTEXT (analysis + root causes):
{context}
"""
        },
    ]

    response = client.chat.completions.create(
        model=DEPLOYMENT,
        messages=messages,
        temperature=0.3,
        max_tokens=300,
    )

    return response.choices[0].message.content.strip()
