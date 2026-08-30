"""Profile schemas."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class TonePreference(str, Enum):
    concise = "concise"
    conversational = "conversational"
    technical = "technical"
    balanced = "balanced"


class ProfileBase(BaseModel):
    profile_name: str = Field(..., min_length=1, max_length=100)
    headline: str = Field(..., min_length=1, max_length=300)
    years_experience: int = Field(..., ge=0, le=50)
    summary: str = Field(..., min_length=10)
    skills: list[str] = Field(..., min_length=1, max_length=20)
    industries: list[str] = Field(default_factory=list)
    specialties: Optional[str] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None
    upwork_url: Optional[str] = None
    ai_instructions: Optional[str] = None
    tone_preference: TonePreference = TonePreference.balanced
    preferred_length: int = Field(default=500, ge=100, le=1500)
    is_default: bool = False


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    profile_name: Optional[str] = None
    headline: Optional[str] = None
    years_experience: Optional[int] = None
    summary: Optional[str] = None
    skills: Optional[list[str]] = None
    industries: Optional[list[str]] = None
    specialties: Optional[str] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None
    upwork_url: Optional[str] = None
    ai_instructions: Optional[str] = None
    tone_preference: Optional[TonePreference] = None
    preferred_length: Optional[int] = None
    is_default: Optional[bool] = None


class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
