"""
BidLens Backend — Database Connection
Configures the Supabase client for database operations.
"""

import logging
from supabase import create_client, Client
from app.core import get_settings

logger = logging.getLogger(__name__)

def get_supabase_client() -> Client:
    """
    Initialize and return a Supabase client using the Service Role Key.
    This client bypasses RLS, so we must always filter by user_id explicitly in queries.
    """
    settings = get_settings()
    
    if not settings.supabase_url or not settings.supabase_service_role_key:
        logger.warning("Supabase URL or Service Role Key missing. Database operations will fail.")
        # Return a dummy client or raise error? In dev, it might be better to raise so we know quickly.
        # But we don't want to crash on import.
    
    return create_client(
        settings.supabase_url, 
        settings.supabase_service_role_key
    )

# Singleton client instance
supabase = get_supabase_client()
