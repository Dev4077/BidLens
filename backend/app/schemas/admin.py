"""
BidLens Schemas — Super Admin Models
Data validation schemas for admin dashboard statistics, user creation, token cost tracking, multi-model AI routing, and activity logs.
"""

from pydantic import BaseModel
from typing import Optional, Union, Any
from datetime import datetime


class AdminStatsResponse(BaseModel):
    total_users: int
    active_subscribers: int
    mrr_usd: float
    total_proposals: int
    total_documents: int
    total_vectors: int
    total_tokens_used: int
    total_cost_usd: float
    avg_latency_sec: float


class AdminUserItem(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    tier: str
    status: str
    assigned_model: Optional[str] = "gpt-4o"
    proposals_used: int
    proposals_limit: int
    tokens_used: int
    estimated_cost_usd: float
    created_at: Union[str, datetime]
    last_active: str


class AdminUserListResponse(BaseModel):
    users: list[AdminUserItem]
    total: int


class AdminUserCreateRequest(BaseModel):
    email: str
    full_name: str
    password: Optional[str] = "password123"
    tier: Optional[str] = "free"
    proposals_limit: Optional[int] = 3
    role: Optional[str] = "user"
    assigned_model: Optional[str] = "gpt-4o"


class AdminUserUpdateRequest(BaseModel):
    tier: Optional[str] = None
    status: Optional[str] = None
    assigned_model: Optional[str] = None
    proposals_limit: Optional[int] = None
    proposals_used: Optional[int] = None
    tokens_used: Optional[int] = None
    role: Optional[str] = None


class AdminActivityItem(BaseModel):
    id: str
    user_email: str
    job_title: str
    model: str
    status: str
    tokens: int
    cost_usd: float
    latency_sec: float
    timestamp: str
    variants_generated: int


class SupportedModelItem(BaseModel):
    id: str
    name: str
    provider: str
    badge: str
    description: str


class AdminModelListResponse(BaseModel):
    models: list[SupportedModelItem]
    default_model: str
