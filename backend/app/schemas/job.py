"""Job schemas."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class JobStatus(str, Enum):
    pending = "pending"
    analyzing = "analyzing"
    completed = "completed"
    failed = "failed"


class JobCreate(BaseModel):
    job_description_raw: str = Field(..., min_length=20)
    profile_id: str
    document_ids: list[str] = Field(default_factory=list)


class JobResponse(BaseModel):
    id: str
    user_id: str
    profile_id: str
    job_description_raw: str
    document_ids: list[str]
    status: JobStatus
    created_at: datetime

    model_config = {"from_attributes": True}
