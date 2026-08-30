"""
BidLens Backend — Multi-Provider Dynamic LLM Router
Supports seamless switching between OpenAI (GPT-4o), Google Gemini, and Groq (LLaMA/Qwen/OSS).
"""

import logging
from typing import Optional
from langchain_openai import ChatOpenAI
from langchain_core.language_models.chat_models import BaseChatModel

from app.core import get_settings

logger = logging.getLogger(__name__)

SUPPORTED_MODELS = [
    {
        "id": "gpt-4o",
        "name": "OpenAI GPT-4o (Flagship)",
        "provider": "openai",
        "badge": "High Accuracy",
        "description": "Best for complex technical requirements & deep reasoning",
    },
    {
        "id": "gpt-4o-mini",
        "name": "OpenAI GPT-4o Mini",
        "provider": "openai",
        "badge": "Cost Efficient",
        "description": "Fast, high-volume proposal generation",
    },
    {
        "id": "gemini-3.6-flash",
        "name": "Google Gemini 3.6 Flash",
        "provider": "google",
        "badge": "Ultra Fast",
        "description": "Instant generation with strong multimodal context",
    },
    {
        "id": "gemini-3.6-pro",
        "name": "Google Gemini 3.6 Pro",
        "provider": "google",
        "badge": "Deep Reasoning",
        "description": "Advanced problem analysis & structured synthesis",
    },
    {
        "id": "qwen/qwen3.8-27b",
        "name": "Groq Qwen 3.8 27B",
        "provider": "groq",
        "badge": "Groq Speed",
        "description": "High-throughput inference on LPUs",
    },
    {
        "id": "openai/gpt-oss-120b",
        "name": "Groq GPT-OSS 120B",
        "provider": "groq",
        "badge": "Open Source",
        "description": "Open weights architecture with extreme throughput",
    },
]


def resolve_llm(
    model_name: Optional[str] = None,
    temperature: float = 0.3,
) -> BaseChatModel:
    """
    Dynamically resolve and instantiate the LLM based on user selection or system config.
    """
    settings = get_settings()
    target_model = model_name or settings.openai_model or "gpt-4o"

    # 1. Google Gemini Provider
    if "gemini" in target_model.lower():
        api_key = settings.google_api_key or settings.openai_api_key
        return ChatOpenAI(
            model=target_model,
            api_key=api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            temperature=temperature,
        )

    # 2. Groq Provider
    elif any(k in target_model.lower() for k in ["qwen", "gpt-oss", "groq", "llama", "mixtral"]):
        api_key = settings.groq_api_key or settings.openai_api_key
        return ChatOpenAI(
            model=target_model,
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
            temperature=temperature,
        )

    # 3. OpenAI Default Provider
    else:
        return ChatOpenAI(
            model=target_model,
            api_key=settings.openai_api_key,
            temperature=temperature,
        )
