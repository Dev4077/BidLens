"""
BidLens API — Profiles Endpoints
CRUD operations for user profiles with strict multi-tenant user isolation.
"""

from datetime import datetime, timezone
import logging
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import require_auth
from app.core.db import supabase
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory fallback profiles
_demo_profiles: list[dict] = []


@router.get("", response_model=list[ProfileResponse])
async def list_profiles(user: dict = Depends(require_auth)):
    """List all profiles for the authenticated user."""
    user_id = user["user_id"]
    try:
        res = supabase.table("profiles").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        if res.data and len(res.data) > 0:
            return [ProfileResponse(**p) for p in res.data]
    except Exception as e:
        logger.warning(f"Supabase profiles query notice (using fallback): {e}")

    user_profiles = [p for p in _demo_profiles if p.get("user_id") == user_id]
    return [ProfileResponse(**p) for p in user_profiles]


@router.get("/{profile_id}", response_model=ProfileResponse)
async def get_profile(profile_id: str, user: dict = Depends(require_auth)):
    """Get a specific profile for the authenticated user."""
    user_id = user["user_id"]
    try:
        res = supabase.table("profiles").select("*").eq("id", profile_id).eq("user_id", user_id).execute()
        if res.data and len(res.data) > 0:
            return ProfileResponse(**res.data[0])
    except Exception as e:
        logger.warning(f"Supabase profile get notice: {e}")

    for p in _demo_profiles:
        if p["id"] == profile_id and p.get("user_id") == user_id:
            return ProfileResponse(**p)

    raise HTTPException(status_code=404, detail="Profile not found")


@router.post("", response_model=ProfileResponse, status_code=201)
async def create_profile(data: ProfileCreate, user: dict = Depends(require_auth)):
    """Create a new profile for the authenticated user."""
    user_id = user["user_id"]
    profile_data = {
        "user_id": user_id,
        **data.model_dump(),
    }

    try:
        if data.is_default:
            supabase.table("profiles").update({"is_default": False}).eq("user_id", user_id).execute()

        res = supabase.table("profiles").insert(profile_data).execute()
        if res.data and len(res.data) > 0:
            return ProfileResponse(**res.data[0])
    except Exception as e:
        logger.warning(f"Supabase insert profile notice: {e}")

    new_p = {
        "id": f"prof-{int(datetime.now(timezone.utc).timestamp())}",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        **profile_data,
    }
    if new_p["is_default"]:
        for p in _demo_profiles:
            if p.get("user_id") == user_id:
                p["is_default"] = False
    _demo_profiles.insert(0, new_p)
    return ProfileResponse(**new_p)


@router.put("/{profile_id}", response_model=ProfileResponse)
async def update_profile(
    profile_id: str,
    data: ProfileUpdate,
    user: dict = Depends(require_auth),
):
    """Update an existing profile belonging to the user."""
    user_id = user["user_id"]
    updates = data.model_dump(exclude_unset=True)

    try:
        if updates.get("is_default"):
            supabase.table("profiles").update({"is_default": False}).eq("user_id", user_id).execute()

        res = supabase.table("profiles").update(updates).eq("id", profile_id).eq("user_id", user_id).execute()
        if res.data and len(res.data) > 0:
            return ProfileResponse(**res.data[0])
    except Exception as e:
        logger.warning(f"Supabase update profile notice: {e}")

    for p in _demo_profiles:
        if p["id"] == profile_id and p.get("user_id") == user_id:
            p.update(updates)
            p["updated_at"] = datetime.now(timezone.utc).isoformat()
            return ProfileResponse(**p)

    raise HTTPException(status_code=404, detail="Profile not found")


@router.delete("/{profile_id}", status_code=204)
async def delete_profile(profile_id: str, user: dict = Depends(require_auth)):
    """Delete a profile belonging to the user."""
    user_id = user["user_id"]
    try:
        supabase.table("profiles").delete().eq("id", profile_id).eq("user_id", user_id).execute()
    except Exception as e:
        logger.warning(f"Supabase delete notice: {e}")

    global _demo_profiles
    _demo_profiles = [p for p in _demo_profiles if not (p["id"] == profile_id and p.get("user_id") == user_id)]


@router.post("/{profile_id}/set-default", response_model=ProfileResponse)
async def set_default_profile(profile_id: str, user: dict = Depends(require_auth)):
    """Set a profile as the default for the user."""
    user_id = user["user_id"]
    try:
        supabase.table("profiles").update({"is_default": False}).eq("user_id", user_id).execute()
        res = supabase.table("profiles").update({"is_default": True}).eq("id", profile_id).eq("user_id", user_id).execute()
        if res.data and len(res.data) > 0:
            return ProfileResponse(**res.data[0])
    except Exception as e:
        logger.warning(f"Supabase set-default notice: {e}")

    for p in _demo_profiles:
        if p.get("user_id") == user_id:
            p["is_default"] = (p["id"] == profile_id)
            if p["id"] == profile_id:
                return ProfileResponse(**p)

    raise HTTPException(status_code=404, detail="Profile not found")
