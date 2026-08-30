"""
BidLens API — Auth Endpoints
Handles user signup registration sync, profile onboarding sync, and session validation.
"""

from datetime import datetime, timezone
import logging
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter

from app.core.db import supabase
from app.api.v1.endpoints.admin import _admin_users_db, _default_ai_model

router = APIRouter()
logger = logging.getLogger(__name__)


class SignupRequest(BaseModel):
    id: Optional[str] = None
    email: str
    full_name: str
    tier: Optional[str] = "free"
    assigned_model: Optional[str] = None


@router.post("/signup", status_code=201)
async def sync_signup_user(data: SignupRequest):
    """Sync a newly registered user into the database and admin records."""
    email_lower = data.email.lower().strip()
    user_id = data.id or f"usr-{int(datetime.now(timezone.utc).timestamp())}"

    # Check if already exists in memory
    for u in _admin_users_db:
        if u["email"].lower() == email_lower:
            return {"status": "exists", "user": u}

    new_user = {
        "id": user_id,
        "email": email_lower,
        "full_name": data.full_name,
        "role": "admin" if email_lower == "dev@sakarsa.com" else "user",
        "tier": "pro" if email_lower == "dev@sakarsa.com" else (data.tier or "free"),
        "status": "active",
        "assigned_model": data.assigned_model or _default_ai_model,
        "proposals_used": 0,
        "proposals_limit": -1 if email_lower == "dev@sakarsa.com" else 3,
        "tokens_used": 0,
        "estimated_cost_usd": 0.0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_active": "Just now",
    }

    _admin_users_db.append(new_user)

    # Persist to Supabase app_users table
    try:
        supabase.table("app_users").upsert(new_user).execute()
    except Exception as e:
        logger.warning(f"Supabase app_users sync notice: {e}")

    return {"status": "created", "user": new_user}
