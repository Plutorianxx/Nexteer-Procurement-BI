from pydantic import BaseModel
from typing import Optional, Literal

class LLMConfig(BaseModel):
    provider: str = "openai"  # openai, gemini, anthropic, etc.
    api_key: str
    base_url: Optional[str] = None
    model: str
    temperature: float = 0.7

class ReportRequest(BaseModel):
    session_id: str
    context_type: Literal["dashboard", "commodity", "supplier"]
    context_value: Optional[str] = None  # e.g. commodity name or supplier name
    config: LLMConfig
