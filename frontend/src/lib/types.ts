// ============================================================================
// BidLens — Core Type Definitions
// ============================================================================

// --- Auth & User ---
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  tier: BillingTier;
  credits_used: number;
  credits_limit: number;
  created_at: string;
}

export type BillingTier = "free" | "starter" | "growth" | "power" | "pro";

// --- Profiles ---
export interface Profile {
  id: string;
  user_id: string;
  profile_name: string;
  headline: string;
  years_experience: number;
  summary: string;
  skills: string[];
  industries?: string[];
  specialties?: string;
  portfolio_url?: string;
  github_url?: string;
  website_url?: string;
  upwork_url?: string;
  ai_instructions?: string;
  tone_preference: TonePreference;
  preferred_length: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type TonePreference = "concise" | "conversational" | "technical" | "balanced";

export interface ProfileFormData {
  profile_name: string;
  headline: string;
  years_experience: number;
  summary: string;
  skills: string[];
  industries?: string[];
  specialties?: string;
  portfolio_url?: string;
  github_url?: string;
  website_url?: string;
  upwork_url?: string;
  ai_instructions?: string;
  tone_preference: TonePreference;
  preferred_length: number;
  is_default: boolean;
}

// --- Knowledge Base ---
export interface KnowledgeDocument {
  id: string;
  user_id: string;
  filename: string;
  file_type: DocumentType;
  status: DocumentStatus;
  size: number;
  total_chunks: number;
  created_at: string;
}

export type DocumentType = "pdf" | "docx" | "txt" | "md" | "csv";
export type DocumentStatus = "processing" | "indexed" | "failed";

// --- Jobs ---
export interface Job {
  id: string;
  user_id: string;
  profile_id: string;
  job_description_raw: string;
  document_ids: string[];
  status: JobStatus;
  created_at: string;
  profile?: Profile;
  proposal?: Proposal;
}

export type JobStatus = "pending" | "analyzing" | "completed" | "failed";

// --- Proposals ---
export interface Proposal {
  id: string;
  job_id: string;
  ai_analysis: AIAnalysis;
  match_score: MatchScore;
  cover_letter_variants: CoverLetterVariants;
  created_at: string;
}

export interface AIAnalysis {
  summary: string;
  client_requirements: string[];
  primary_objective: string;
  technical_requirements: string[];
  deliverables: string[];
  potential_challenges: string[];
  required_skills: string[];
  client_health: number;       // 0-100
  apply_confidence: number;    // 0-100
  interview_chance: number;    // 0-100
}

export interface MatchScore {
  overall: number;
  requirements: number;
  skills: number;
  experience: number;
  technical_fit: number;
  matched_skills: string[];
  missing_skills: string[];
}

export interface CoverLetterVariants {
  balanced: string;
  technical: string;
  conversational: string;
}

// --- Chat ---
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  job_id: string;
  message: string;
  active_variant: keyof CoverLetterVariants;
}

// --- SSE Events ---
export interface SSEEvent {
  type: "token" | "phase" | "complete" | "error";
  data: string;
  phase?: GenerationPhase;
}

export type GenerationPhase =
  | "parsing"
  | "matching"
  | "retrieving"
  | "generating"
  | "complete";

// --- Billing ---
export interface BillingPlan {
  id: BillingTier;
  name: string;
  price: number;
  period: "week" | "month";
  proposals_limit: number;
  features: string[];
  highlighted?: boolean;
}

// --- API Response Wrappers ---
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

// --- Dashboard Stats ---
export interface DashboardStats {
  total_jobs: number;
  proposals_generated: number;
  avg_match_score: number;
  credits_remaining: number;
}

// --- Knowledge Base Stats ---
export interface KnowledgeBaseStats {
  total_documents: number;
  total_chunks: number;
  indexed_count: number;
  processing_count: number;
}
