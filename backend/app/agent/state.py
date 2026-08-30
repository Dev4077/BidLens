"""
BidLens Agent — State Definition
Defines the TypedDict state that flows through the LangGraph proposal generation pipeline.
"""

from typing import TypedDict, Optional, Any


class ProposalState(TypedDict, total=False):
    """State object passed through the LangGraph proposal generation pipeline."""

    # --- Inputs ---
    job_description: str
    profile: dict[str, Any]
    document_ids: list[str]
    user_id: str
    model_name: Optional[str]

    # --- After Job Parsing ---
    parsed_job: dict[str, Any]
    # Contains: summary, client_requirements, primary_objective,
    # technical_requirements, deliverables, potential_challenges,
    # required_skills, client_health, apply_confidence, interview_chance

    # --- After Profile Matching ---
    match_score: dict[str, Any]
    # Contains: overall, requirements, skills, experience,
    # technical_fit, matched_skills, missing_skills

    # --- After RAG Retrieval ---
    rag_context: list[str]
    # Semantically relevant chunks from selected documents

    # --- After Generation ---
    cover_letters: dict[str, str]
    # Contains: balanced, technical, conversational

    # --- Chat Iteration ---
    chat_history: list[dict[str, str]]
    chat_input: str
    active_variant: str
    updated_letter: str

    # --- Error Handling ---
    error: Optional[str]
    current_phase: str
