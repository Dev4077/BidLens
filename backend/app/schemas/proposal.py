"""Proposal schemas."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AIAnalysis(BaseModel):
    summary: str
    client_requirements: list[str]
    primary_objective: str
    technical_requirements: list[str]
    deliverables: list[str]
    potential_challenges: list[str]
    required_skills: list[str]
    client_health: int  # 0-100
    apply_confidence: int  # 0-100
    interview_chance: int  # 0-100


class MatchScore(BaseModel):
    overall: int
    requirements: int
    skills: int
    experience: int
    technical_fit: int
    matched_skills: list[str]
    missing_skills: list[str]


class CoverLetterVariants(BaseModel):
    balanced: str
    technical: str
    conversational: str


class ProposalResponse(BaseModel):
    id: str
    job_id: str
    ai_analysis: AIAnalysis
    match_score: MatchScore
    cover_letter_variants: CoverLetterVariants
    created_at: datetime

    model_config = {"from_attributes": True}


class QuickActionRequest(BaseModel):
    action: str  # shorter, more_technical, more_conversational, improve_opening
    variant: str  # balanced, technical, conversational


class QuickActionResponse(BaseModel):
    content: str
