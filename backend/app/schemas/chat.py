"""Chat schemas."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ChatRequest(BaseModel):
    job_id: str
    message: str
    active_variant: str = "balanced"  # balanced, technical, conversational


class ChatMessage(BaseModel):
    id: str
    role: str  # user, assistant
    content: str
    timestamp: datetime


class SSEEvent(BaseModel):
    type: str  # token, phase, complete, error
    data: str
    phase: Optional[str] = None
