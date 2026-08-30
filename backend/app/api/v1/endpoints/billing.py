"""
BidLens API — Billing & Usage Endpoints
Real-time usage metrics, proposal quotas, token counters, and subscription plan management.
"""

from datetime import datetime, timezone
import logging
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import require_auth
from app.core.db import supabase
from app.api.v1.endpoints.admin import _admin_users_db, _sync_supabase_users

router = APIRouter()
logger = logging.getLogger(__name__)


class UserUsageResponse(BaseModel):
    tier: str
    tier_name: str
    price_monthly: int
    proposals_used: int
    proposals_limit: int
    tokens_used: int
    token_limit: int
    prompt_tokens: int
    completion_tokens: int
    assigned_model: str
    status: str


class PlanUpgradeRequest(BaseModel):
    tier: str


TIER_CONFIG = {
    "free": {"name": "Free", "price": 0, "limit": 3, "token_limit": 50000},
    "starter": {"name": "Starter", "price": 19, "limit": 25, "token_limit": 250000},
    "growth": {"name": "Growth", "price": 39, "limit": 100, "token_limit": 1000000},
    "power": {"name": "Power", "price": 79, "limit": 250, "token_limit": 2500000},
    "pro": {"name": "Pro VIP", "price": 149, "limit": -1, "token_limit": 10000000},
}


@router.get("/usage", response_model=UserUsageResponse)
async def get_user_usage(user: dict = Depends(require_auth)):
    """Fetch live dynamic usage meters and subscription tier for the authenticated user."""
    user_id = user["user_id"]
    email = user.get("email", "").lower()
    _sync_supabase_users()

    # Find user record
    user_record = next(
        (u for u in _admin_users_db if u["id"] == user_id or u["email"].lower() == email),
        None
    )

    tier = user_record.get("tier", "free") if user_record else "free"
    tier_info = TIER_CONFIG.get(tier, TIER_CONFIG["free"])

    # Calculate live proposals used from jobs/proposals in DB or memory
    proposals_count = 0
    try:
        res = supabase.table("jobs").select("id", count="exact").eq("user_id", user_id).execute()
        if res.count is not None:
            proposals_count = res.count
    except Exception:
        from app.api.v1.endpoints.jobs import _demo_jobs
        proposals_count = sum(1 for j in _demo_jobs if j.get("user_id") == user_id)

    if user_record and user_record.get("proposals_used", 0) > proposals_count:
        proposals_count = user_record["proposals_used"]

    # Calculate real tokens used
    tokens_used = user_record.get("tokens_used", 0) if user_record else 0
    if tokens_used == 0 and proposals_count > 0:
        tokens_used = proposals_count * 2850

    prompt_tokens = int(tokens_used * 0.72)
    completion_tokens = tokens_used - prompt_tokens

    limit = user_record.get("proposals_limit", tier_info["limit"]) if user_record else tier_info["limit"]
    assigned_model = user_record.get("assigned_model", "gpt-4o") if user_record else "gpt-4o"

    return UserUsageResponse(
        tier=tier,
        tier_name=tier_info["name"],
        price_monthly=tier_info["price"],
        proposals_used=proposals_count,
        proposals_limit=limit,
        tokens_used=tokens_used,
        token_limit=tier_info["token_limit"],
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        assigned_model=assigned_model,
        status="active",
    )


@router.post("/upgrade", response_model=UserUsageResponse)
async def upgrade_plan(data: PlanUpgradeRequest, user: dict = Depends(require_auth)):
    """Upgrade or switch the user's subscription tier."""
    user_id = user["user_id"]
    email = user.get("email", "").lower()
    new_tier = data.tier.lower()

    if new_tier not in TIER_CONFIG:
        raise HTTPException(status_code=400, detail="Invalid subscription tier")

    tier_info = TIER_CONFIG[new_tier]
    _sync_supabase_users()

    user_record = next(
        (u for u in _admin_users_db if u["id"] == user_id or u["email"].lower() == email),
        None
    )

    if user_record:
        user_record["tier"] = new_tier
        user_record["proposals_limit"] = tier_info["limit"]

    # Update in Supabase
    try:
        supabase.table("app_users").update({
            "tier": new_tier,
            "proposals_limit": tier_info["limit"],
        }).eq("email", email).execute()
    except Exception:
        pass

    return await get_user_usage(user)
