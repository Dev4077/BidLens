"""
BidLens Backend — FastAPI Application Entry Point
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core import get_settings
from app.api.v1.router import router as api_v1_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    logger.info("🚀 BidLens API starting up...")
    settings = get_settings()
    logger.info(f"   Environment: {settings.app_env}")
    logger.info(f"   CORS origins: {settings.cors_origin_list}")

    if not settings.openai_api_key:
        logger.warning("⚠️  No OPENAI_API_KEY configured — AI features will use fallbacks")
    if not settings.supabase_url:
        logger.warning("⚠️  No SUPABASE_URL configured — using in-memory storage")

    yield
    logger.info("👋 BidLens API shutting down...")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        description="AI-powered proposal generation and job analysis platform for freelancers",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routes
    app.include_router(api_v1_router)

    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy",
            "service": settings.app_name,
            "version": "1.0.0",
        }

    return app


app = create_app()
