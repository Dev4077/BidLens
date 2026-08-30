"""
BidLens API — Super Admin Endpoints
System oversight, multi-tenant user creation & management, subscription overrides, AI model assignment, and token cost tracking.
"""

from datetime import datetime, timezone
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.security import require_admin
from app.core.db import supabase
from app.core.llm_provider import SUPPORTED_MODELS
from app.schemas.admin import (
    AdminStatsResponse,
    AdminUserListResponse,
    AdminUserItem,
    AdminUserCreateRequest,
    AdminUserUpdateRequest,
    AdminActivityItem,
    AdminModelListResponse,
    SupportedModelItem,
)

router = APIRouter()
logger = logging.getLogger(__name__)

# GPT-4o pricing estimate: ~$0.006 per 1k tokens on blended prompt/completion
TOKEN_COST_PER_1K = 0.006

# Clean user database with dev@sakarsa.com as root Super Admin
_admin_users_db: list[dict] = [
    {
        "id": "00000000-0000-0000-0000-000000000001",
        "email": "dev@sakarsa.com",
        "full_name": "Sakarsa Super Admin",
        "role": "admin",
        "tier": "pro",
        "status": "active",
        "assigned_model": "gpt-4o",
        "proposals_used": 0,
        "proposals_limit": -1,
        "tokens_used": 0,
        "estimated_cost_usd": 0.0,
        "created_at": "2026-01-01T00:00:00Z",
        "last_active": "Just now",
    },
]

_default_ai_model: str = "gpt-4o"
_admin_activity_log: list[dict] = []


def _sync_supabase_users():
    """Sync all users from Supabase Auth, app_users, jobs, and proposals tables into _admin_users_db."""
    global _admin_users_db, _admin_activity_log

    # 1. Sync from Supabase Auth users
    try:
        auth_users = supabase.auth.admin.list_users()
        for au in auth_users:
            email = (au.email or "").lower().strip()
            if not email:
                continue
            full_name = (
                (au.user_metadata or {}).get("full_name")
                or (au.user_metadata or {}).get("name")
                or email.split("@")[0].title()
            )
            existing = next((u for u in _admin_users_db if u["email"].lower() == email or u["id"] == str(au.id)), None)
            if existing:
                existing["id"] = str(au.id)
                existing["email"] = email
                if not existing.get("full_name") or existing["full_name"] == "Freelancer":
                    existing["full_name"] = full_name
            else:
                is_admin = email == "dev@sakarsa.com"
                created_val = getattr(au, "created_at", None)
                if isinstance(created_val, datetime):
                    created_str = created_val.isoformat()
                elif created_val:
                    created_str = str(created_val)
                else:
                    created_str = datetime.now(timezone.utc).isoformat()

                new_entry = {
                    "id": str(au.id),
                    "email": email,
                    "full_name": full_name,
                    "role": "admin" if is_admin else "user",
                    "tier": "pro" if is_admin else "free",
                    "status": "active",
                    "assigned_model": _default_ai_model,
                    "proposals_used": 0,
                    "proposals_limit": -1 if is_admin else 3,
                    "tokens_used": 0,
                    "estimated_cost_usd": 0.0,
                    "created_at": created_str,
                    "last_active": "Just now",
                }
                _admin_users_db.append(new_entry)
    except Exception as e:
        logger.warning(f"Supabase Auth list notice: {e}")

    # 2. Sync from app_users table
    try:
        res = supabase.table("app_users").select("*").execute()
        if res.data:
            for u in res.data:
                existing = next((x for x in _admin_users_db if x["email"].lower() == u["email"].lower() or x["id"] == u["id"]), None)
                if existing:
                    for k, v in u.items():
                        if k in ("proposals_used", "tokens_used", "estimated_cost_usd"):
                            if v and v > existing.get(k, 0):
                                existing[k] = v
                        elif v is not None:
                            existing[k] = v
                else:
                    _admin_users_db.append(u)
    except Exception as e:
        logger.warning(f"Supabase app_users table query notice: {e}")

    # 3. Live aggregate actual proposals and tokens from Supabase jobs table & memory
    try:
        all_jobs = []
        try:
            jobs_res = supabase.table("jobs").select("*").order("created_at", desc=True).execute()
            if jobs_res.data:
                all_jobs.extend(jobs_res.data)
        except Exception as e:
            logger.warning(f"Supabase jobs query in admin notice: {e}")

        # Also merge in-memory _demo_jobs
        try:
            from app.api.v1.endpoints.jobs import _demo_jobs
            for dj in _demo_jobs:
                if not any(j["id"] == dj["id"] for j in all_jobs):
                    all_jobs.append(dj)
        except Exception:
            pass

        # Build activity logs and aggregate metrics per user
        activity_items = []
        for j in all_jobs:
            job_uid = str(j.get("user_id", ""))
            model_used = j.get("model_used") or "gemini-3.6-flash"
            tokens = 2850
            cost = round((tokens / 1000) * TOKEN_COST_PER_1K, 4)
            job_created = j.get("created_at") or datetime.now(timezone.utc).isoformat()

            # Find matching user
            matched_user = next((u for u in _admin_users_db if u["id"] == job_uid or u["email"].lower() == job_uid.lower()), None)
            user_email = matched_user["email"] if matched_user else job_uid

            activity_items.append({
                "id": f"act-{j.get('id', 'job')}",
                "user_email": user_email,
                "job_title": j.get("job_description_raw", "")[:60].strip() or "Full-Stack Proposal Generation",
                "model": model_used,
                "status": j.get("status", "completed"),
                "tokens": tokens,
                "cost_usd": cost,
                "latency_sec": 3.2,
                "timestamp": str(job_created),
                "variants_generated": 3,
            })

        _admin_activity_log.clear()
        _admin_activity_log.extend(activity_items)

        # Calculate per-user proposal count & tokens
        for u in _admin_users_db:
            u_id = str(u.get("id", ""))
            u_email = str(u.get("email", "")).lower()

            user_jobs = [j for j in all_jobs if str(j.get("user_id", "")) in (u_id, u_email)]
            job_count = len(user_jobs)

            if job_count > 0:
                u["proposals_used"] = max(u.get("proposals_used", 0), job_count)
                u["tokens_used"] = max(u.get("tokens_used", 0), u["proposals_used"] * 2850)
                u["estimated_cost_usd"] = round((u["tokens_used"] / 1000) * TOKEN_COST_PER_1K, 3)

                if user_jobs[0].get("created_at"):
                    u["last_active"] = str(user_jobs[0]["created_at"])

                latest_model = user_jobs[0].get("model_used")
                if latest_model and any(m["id"] == latest_model for m in SUPPORTED_MODELS):
                    u["assigned_model"] = latest_model

                # Keep app_users table in sync
                try:
                    supabase.table("app_users").upsert({
                        "id": u["id"],
                        "email": u["email"],
                        "full_name": u.get("full_name", "User"),
                        "role": u.get("role", "user"),
                        "tier": u.get("tier", "free"),
                        "status": u.get("status", "active"),
                        "assigned_model": u.get("assigned_model", "gpt-4o"),
                        "proposals_used": u["proposals_used"],
                        "proposals_limit": u.get("proposals_limit", 3),
                        "tokens_used": u["tokens_used"],
                        "estimated_cost_usd": u["estimated_cost_usd"],
                        "last_active": u["last_active"],
                    }).execute()
                except Exception:
                    pass

    except Exception as e:
        logger.error(f"Live jobs metric aggregation error: {e}")


def record_proposal_activity(user_id: str, job_id: str, job_title: str, model_used: str, tokens: int = 2850):
    """Record a live proposal generation event in admin metrics & activity log."""
    global _admin_activity_log
    _sync_supabase_users()

    user_record = next(
        (u for u in _admin_users_db if u["id"] == user_id or u["email"].lower() == user_id.lower()),
        None
    )

    user_email = user_record["email"] if user_record else user_id
    cost = round((tokens / 1000) * TOKEN_COST_PER_1K, 4)
    now_str = datetime.now(timezone.utc).isoformat()

    if user_record:
        user_record["proposals_used"] = user_record.get("proposals_used", 0) + 1
        user_record["tokens_used"] = user_record.get("tokens_used", 0) + tokens
        user_record["estimated_cost_usd"] = round((user_record["tokens_used"] / 1000) * TOKEN_COST_PER_1K, 3)
        user_record["last_active"] = now_str
        if model_used:
            user_record["assigned_model"] = model_used

        try:
            supabase.table("app_users").upsert({
                "id": user_record["id"],
                "email": user_record["email"],
                "full_name": user_record.get("full_name", "User"),
                "role": user_record.get("role", "user"),
                "tier": user_record.get("tier", "free"),
                "status": user_record.get("status", "active"),
                "assigned_model": user_record.get("assigned_model", "gpt-4o"),
                "proposals_used": user_record["proposals_used"],
                "proposals_limit": user_record.get("proposals_limit", 3),
                "tokens_used": user_record["tokens_used"],
                "estimated_cost_usd": user_record["estimated_cost_usd"],
                "last_active": now_str,
            }).execute()
        except Exception:
            pass

    _admin_activity_log.insert(0, {
        "id": f"act-{job_id}",
        "user_email": user_email,
        "job_title": job_title[:60].strip() or "Proposal Generation",
        "model": model_used,
        "status": "completed",
        "tokens": tokens,
        "cost_usd": cost,
        "latency_sec": 3.2,
        "timestamp": now_str,
        "variants_generated": 3,
    })


def get_user_assigned_model(user_id: str) -> str:
    """Retrieve assigned model for a specific user ID."""
    _sync_supabase_users()
    for u in _admin_users_db:
        if u["id"] == user_id or u.get("email") == user_id:
            return u.get("assigned_model", _default_ai_model)
    return _default_ai_model


@router.get("/models", response_model=AdminModelListResponse)
async def list_supported_models(admin: dict = Depends(require_admin)):
    """List all supported AI models (OpenAI, Gemini, Groq)."""
    return AdminModelListResponse(
        models=[SupportedModelItem(**m) for m in SUPPORTED_MODELS],
        default_model=_default_ai_model,
    )


@router.put("/models/default")
async def update_default_model(model: str = Query(...), admin: dict = Depends(require_admin)):
    """Set the system-wide default AI model."""
    global _default_ai_model
    if not any(m["id"] == model for m in SUPPORTED_MODELS):
        raise HTTPException(status_code=400, detail="Unsupported model ID")
    _default_ai_model = model
    return {"status": "success", "default_model": _default_ai_model}


@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(admin: dict = Depends(require_admin)):
    """Fetch system-wide KPIs, MRR, and token expenditures."""
    _sync_supabase_users()

    total_users = len(_admin_users_db)
    active_subscribers = sum(1 for u in _admin_users_db if u["role"] != "admin" and u["tier"] != "free" and u["status"] == "active")

    tier_prices = {"free": 0, "starter": 19, "growth": 39, "power": 79, "pro": 149}
    mrr = sum(tier_prices.get(u["tier"], 0) for u in _admin_users_db if u["role"] != "admin" and u["status"] == "active")
    total_tokens = sum(u.get("tokens_used", 0) for u in _admin_users_db)
    total_cost = sum(u.get("estimated_cost_usd", 0.0) for u in _admin_users_db)
    total_proposals = sum(u.get("proposals_used", 0) for u in _admin_users_db)

    return AdminStatsResponse(
        total_users=total_users,
        active_subscribers=active_subscribers,
        mrr_usd=float(mrr),
        total_proposals=total_proposals,
        total_documents=0,
        total_vectors=0,
        total_tokens_used=total_tokens,
        total_cost_usd=round(total_cost, 2),
        avg_latency_sec=3.2 if total_proposals > 0 else 0.0,
    )


@router.get("/users", response_model=AdminUserListResponse)
async def list_admin_users(
    search: Optional[str] = None,
    tier: Optional[str] = None,
    status: Optional[str] = None,
    admin: dict = Depends(require_admin),
):
    """List and filter users for the Super Admin Panel with token metrics & assigned model."""
    _sync_supabase_users()
    users = _admin_users_db

    if search:
        s = search.lower()
        users = [u for u in users if s in u["email"].lower() or s in u["full_name"].lower()]

    if tier and tier != "all":
        users = [u for u in users if u["tier"].lower() == tier.lower()]

    if status and status != "all":
        users = [u for u in users if u["status"].lower() == status.lower()]

    return AdminUserListResponse(
        users=[AdminUserItem(**u) for u in users],
        total=len(users),
    )


@router.post("/users", response_model=AdminUserItem, status_code=201)
async def create_user_by_admin(
    data: AdminUserCreateRequest,
    admin: dict = Depends(require_admin),
):
    """Create a new user directly from the Super Admin Panel with specific model assignment."""
    _sync_supabase_users()
    for u in _admin_users_db:
        if u["email"].lower() == data.email.lower():
            raise HTTPException(status_code=400, detail="User with this email already exists")

    tier_quotas = {"free": 3, "starter": 25, "growth": 100, "power": 250, "pro": -1}
    limit = data.proposals_limit if data.proposals_limit is not None else tier_quotas.get(data.tier, 3)

    new_user = {
        "id": f"usr-{int(datetime.now(timezone.utc).timestamp())}",
        "email": data.email.lower(),
        "full_name": data.full_name,
        "role": data.role or "user",
        "tier": data.tier or "free",
        "status": "active",
        "assigned_model": data.assigned_model or _default_ai_model,
        "proposals_used": 0,
        "proposals_limit": limit,
        "tokens_used": 0,
        "estimated_cost_usd": 0.0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_active": "Never",
    }

    _admin_users_db.insert(0, new_user)

    # Persist to Supabase if table exists
    try:
        supabase.table("app_users").insert(new_user).execute()
    except Exception:
        pass

    return AdminUserItem(**new_user)


@router.put("/users/{user_id}", response_model=AdminUserItem)
async def update_user_by_admin(
    user_id: str,
    data: AdminUserUpdateRequest,
    admin: dict = Depends(require_admin),
):
    """Super admin update of a user's tier, AI model assignment, proposal limits, tokens, role, or status."""
    _sync_supabase_users()
    for user in _admin_users_db:
        if user["id"] == user_id:
            if data.tier is not None:
                user["tier"] = data.tier
            if data.status is not None:
                user["status"] = data.status
            if data.assigned_model is not None:
                user["assigned_model"] = data.assigned_model
            if data.proposals_limit is not None:
                user["proposals_limit"] = data.proposals_limit
            if data.proposals_used is not None:
                user["proposals_used"] = data.proposals_used
            if data.tokens_used is not None:
                user["tokens_used"] = data.tokens_used
                user["estimated_cost_usd"] = (data.tokens_used / 1000) * TOKEN_COST_PER_1K
            if data.role is not None:
                user["role"] = data.role

            # Sync to Supabase
            try:
                supabase.table("app_users").update({
                    "tier": user["tier"],
                    "status": user["status"],
                    "assigned_model": user.get("assigned_model", "gpt-4o"),
                    "proposals_limit": user["proposals_limit"],
                    "proposals_used": user["proposals_used"],
                    "tokens_used": user["tokens_used"],
                    "estimated_cost_usd": user["estimated_cost_usd"],
                    "role": user["role"],
                }).eq("id", user_id).execute()
            except Exception:
                pass

            return AdminUserItem(**user)

    raise HTTPException(status_code=404, detail="User not found")


@router.delete("/users/{user_id}")
async def delete_user_by_admin(
    user_id: str,
    admin: dict = Depends(require_admin),
):
    """Delete a user account."""
    global _admin_users_db
    _sync_supabase_users()
    user_to_delete = next((u for u in _admin_users_db if u["id"] == user_id), None)
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")

    if user_to_delete.get("email") == "dev@sakarsa.com":
        raise HTTPException(status_code=400, detail="Cannot delete root Super Admin account")

    _admin_users_db = [u for u in _admin_users_db if u["id"] != user_id]

    try:
        supabase.table("app_users").delete().eq("id", user_id).execute()
    except Exception:
        pass

    try:
        supabase.auth.admin.delete_user(user_id)
    except Exception:
        pass

    return {"status": "success", "message": f"User {user_id} deleted successfully"}


@router.get("/activity", response_model=list[AdminActivityItem])
async def list_admin_activity(admin: dict = Depends(require_admin)):
    """Fetch live AI execution log feed."""
    return [AdminActivityItem(**a) for a in _admin_activity_log]
