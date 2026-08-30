-- ============================================================================
-- BidLens — Supabase Database Schema
-- Run this in your Supabase SQL editor to set up all tables
-- ============================================================================

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
    tone_preference VARCHAR(20) NOT NULL DEFAULT 'balanced'
        CHECK (tone_preference IN ('concise', 'conversational', 'technical', 'balanced')),
    preferred_length INTEGER NOT NULL DEFAULT 500
        CHECK (preferred_length BETWEEN 100 AND 1500),
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure only one default profile per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_default 
    ON profiles (user_id) WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles (user_id);

-- ============================================================================
-- 2. KNOWLEDGE DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(10) NOT NULL
        CHECK (file_type IN ('pdf', 'docx', 'txt', 'md', 'csv')),
    status VARCHAR(20) NOT NULL DEFAULT 'processing'
        CHECK (status IN ('processing', 'indexed', 'failed')),
    size INTEGER NOT NULL DEFAULT 0,
    total_chunks INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_docs_user_id ON knowledge_documents (user_id);

-- ============================================================================
-- 3. DOCUMENT CHUNKS TABLE (with pgvector embeddings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),  -- OpenAI text-embedding-3-small dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks (document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_user_id ON document_chunks (user_id);

-- HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_chunks_embedding 
    ON document_chunks USING hnsw (embedding vector_cosine_ops);

-- ============================================================================
-- 4. JOBS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
    job_description_raw TEXT NOT NULL,
    document_ids UUID[] DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs (user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs (status);

-- ============================================================================
-- 5. PROPOSALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    ai_analysis JSONB NOT NULL DEFAULT '{}',
    match_score JSONB NOT NULL DEFAULT '{}',
    cover_letter_variants JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposals_job_id ON proposals (job_id);

-- ============================================================================
-- 6. CHAT MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_job_id ON chat_messages (job_id);

-- ============================================================================
-- 7. USAGE TRACKING TABLE (for billing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_user_id ON usage_tracking (user_id);
CREATE INDEX IF NOT EXISTS idx_usage_created_at ON usage_tracking (created_at);

-- ============================================================================
-- 8. ROW LEVEL SECURITY (multi-tenant isolation)
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own
CREATE POLICY profiles_policy ON profiles
    FOR ALL USING (auth.uid() = user_id);

-- Knowledge documents: users can only access their own
CREATE POLICY knowledge_documents_policy ON knowledge_documents
    FOR ALL USING (auth.uid() = user_id);

-- Document chunks: users can only access their own
CREATE POLICY document_chunks_policy ON document_chunks
    FOR ALL USING (auth.uid() = user_id);

-- Jobs: users can only access their own
CREATE POLICY jobs_policy ON jobs
    FOR ALL USING (auth.uid() = user_id);

-- Proposals: users can access proposals for their own jobs
CREATE POLICY proposals_policy ON proposals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM jobs WHERE jobs.id = proposals.job_id
            AND jobs.user_id = auth.uid()
        )
    );

-- Chat messages: users can only access their own
CREATE POLICY chat_messages_policy ON chat_messages
    FOR ALL USING (auth.uid() = user_id);

-- Usage tracking: users can only access their own
CREATE POLICY usage_tracking_policy ON usage_tracking
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 9. HELPER FUNCTIONS
-- ============================================================================

-- Similarity search function for RAG
CREATE OR REPLACE FUNCTION match_document_chunks(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_user_id uuid DEFAULT NULL,
    filter_document_ids uuid[] DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    document_id uuid,
    content text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        dc.content,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    WHERE
        (filter_user_id IS NULL OR dc.user_id = filter_user_id)
        AND (filter_document_ids IS NULL OR dc.document_id = ANY(filter_document_ids))
        AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
