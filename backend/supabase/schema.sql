-- ============================================================================
-- BidLens — Supabase Full Production Database Schema & Vector Extension
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/mmclmcvpurknisykhiko/sql)
-- ============================================================================

-- 1. Enable pgvector extension for AI semantic search embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- 2. APP USERS TABLE (Multi-tenant accounts, plan tiers, and AI model assignment)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app_users (
    id VARCHAR(100) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    tier VARCHAR(50) NOT NULL DEFAULT 'free',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    assigned_model VARCHAR(100) NOT NULL DEFAULT 'gpt-4o',
    proposals_used INTEGER NOT NULL DEFAULT 0,
    proposals_limit INTEGER NOT NULL DEFAULT 3,
    tokens_used BIGINT NOT NULL DEFAULT 0,
    estimated_cost_usd NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users (email);
CREATE INDEX IF NOT EXISTS idx_app_users_role ON app_users (role);

-- Seed initial Super Admin account
INSERT INTO app_users (id, email, full_name, role, tier, status, assigned_model, proposals_used, proposals_limit, tokens_used, estimated_cost_usd)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'dev@sakarsa.com',
    'Sakarsa Super Admin',
    'admin',
    'pro',
    'active',
    'gpt-4o',
    0,
    -1,
    0,
    0.0000
) ON CONFLICT (email) DO UPDATE SET role = 'admin', tier = 'pro', proposals_limit = -1;


-- ============================================================================
-- 3. PROFILES TABLE (Freelancer profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) NOT NULL,
    profile_name VARCHAR(100) NOT NULL,
    headline VARCHAR(300) NOT NULL,
    years_experience INTEGER NOT NULL DEFAULT 0,
    summary TEXT NOT NULL,
    skills TEXT[] NOT NULL DEFAULT '{}',
    industries TEXT[] DEFAULT '{}',
    specialties TEXT,
    portfolio_url TEXT,
    github_url TEXT,
    website_url TEXT,
    upwork_url TEXT,
    ai_instructions TEXT,
    tone_preference VARCHAR(20) NOT NULL DEFAULT 'balanced',
    preferred_length INTEGER NOT NULL DEFAULT 500,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles (user_id);


-- ============================================================================
-- 4. KNOWLEDGE BASE DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'indexed',
    size INTEGER NOT NULL DEFAULT 0,
    total_chunks INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_docs_user_id ON knowledge_documents (user_id);


-- ============================================================================
-- 5. DOCUMENT CHUNKS TABLE (with 1536-dim pgvector embeddings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_chunks (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    document_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chunks_doc_id ON document_chunks (document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_user_id ON document_chunks (user_id);

-- HNSW Vector Index for sub-millisecond similarity search
CREATE INDEX IF NOT EXISTS idx_chunks_embedding 
    ON document_chunks USING hnsw (embedding vector_cosine_ops);


-- ============================================================================
-- 6. JOBS TABLE (Analyzed job postings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    profile_id VARCHAR(100),
    job_description_raw TEXT NOT NULL,
    document_ids TEXT[] DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    model_used VARCHAR(100) DEFAULT 'gpt-4o',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs (user_id);


-- ============================================================================
-- 7. PROPOSALS TABLE (AI proposal analysis and 3-variant copy)
-- ============================================================================
CREATE TABLE IF NOT EXISTS proposals (
    id VARCHAR(100) PRIMARY KEY,
    job_id VARCHAR(100) NOT NULL,
    ai_analysis JSONB NOT NULL DEFAULT '{}',
    match_score JSONB NOT NULL DEFAULT '{}',
    cover_letter_variants JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposals_job_id ON proposals (job_id);


-- ============================================================================
-- 8. CHAT MESSAGES TABLE (Proposal Assistant conversation history)
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    job_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_job_id ON chat_messages (job_id);


-- ============================================================================
-- 9. ADMIN SETTINGS & SYSTEM CONFIGURATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO admin_settings (key, value)
VALUES 
    ('default_ai_model', '"gpt-4o"'),
    ('supported_models', '["gpt-4o", "gpt-4o-mini", "gemini-3.6-flash", "gemini-3.6-pro", "qwen/qwen3.8-27b", "openai/gpt-oss-120b"]')
ON CONFLICT (key) DO NOTHING;


-- ============================================================================
-- 10. VECTOR COSINE SIMILARITY SEARCH STORED FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION match_document_chunks(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 5,
    filter_user_id text DEFAULT NULL,
    filter_document_ids text[] DEFAULT NULL
)
RETURNS TABLE (
    id text,
    document_id text,
    content text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id::text,
        dc.document_id::text,
        dc.content,
        (1 - (dc.embedding <=> query_embedding))::float AS similarity
    FROM document_chunks dc
    WHERE
        (filter_user_id IS NULL OR dc.user_id = filter_user_id)
        AND (filter_document_ids IS NULL OR dc.document_id = ANY(filter_document_ids))
        AND (1 - (dc.embedding <=> query_embedding)) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
