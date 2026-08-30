"""
BidLens API v1 — Router
Aggregates all endpoint routers.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import profiles, knowledge, jobs, proposals, chat, admin, auth, billing

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router, prefix="/auth", tags=["Auth"])
router.include_router(billing.router, prefix="/billing", tags=["Billing & Usage"])
router.include_router(profiles.router, prefix="/profiles", tags=["Profiles"])
router.include_router(knowledge.router, prefix="/knowledge", tags=["Knowledge Base"])
router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
router.include_router(proposals.router, prefix="/proposals", tags=["Proposals"])
router.include_router(chat.router, prefix="/chat", tags=["Chat"])
router.include_router(admin.router, prefix="/admin", tags=["Super Admin"])
