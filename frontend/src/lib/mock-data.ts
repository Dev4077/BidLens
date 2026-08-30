// ============================================================================
// BidLens — Clean Initial State Data
// ============================================================================

import type {
  Profile,
  KnowledgeDocument,
  Job,
  Proposal,
  DashboardStats,
  KnowledgeBaseStats,
  BillingPlan,
  ChatMessage,
} from "./types";

// Empty Initial Profiles (User creates their own via /onboarding)
export const mockProfiles: Profile[] = [];

// Empty Initial Documents
export const mockDocuments: KnowledgeDocument[] = [];

// Empty Initial Jobs
export const mockJobs: Job[] = [];

// Empty Default Proposal
export const mockProposal: Proposal = {
  id: "pr-empty",
  job_id: "",
  ai_analysis: {
    summary: "Job description parsed.",
    client_requirements: [],
    primary_objective: "Deliver winning proposal",
    technical_requirements: [],
    deliverables: [],
    potential_challenges: [],
    required_skills: [],
    client_health: 85,
    apply_confidence: 90,
    interview_chance: 80,
  },
  match_score: {
    overall: 85,
    requirements: 85,
    skills: 85,
    experience: 85,
    technical_fit: 85,
    matched_skills: [],
    missing_skills: [],
  },
  cover_letter_variants: {
    balanced: "Your tailored proposal will appear here once generated.",
    technical: "Your technical proposal will appear here once generated.",
    conversational: "Your conversational proposal will appear here once generated.",
  },
  created_at: new Date().toISOString(),
};

// Initial Zero Stats
export const mockDashboardStats: DashboardStats = {
  total_jobs: 0,
  proposals_generated: 0,
  avg_match_score: 0,
  credits_remaining: 3,
};

// Initial Zero KB Stats
export const mockKBStats: KnowledgeBaseStats = {
  total_documents: 0,
  total_chunks: 0,
  indexed_count: 0,
  processing_count: 0,
};

// Billing Plans Specifications
export const billingPlans: BillingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "week",
    proposals_limit: 3,
    features: [
      "3 proposals per week",
      "1 freelance profile",
      "5 chat revisions per job",
      "Basic AI analysis",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 19,
    period: "month",
    proposals_limit: 25,
    features: [
      "25 proposals per week",
      "3 specialized profiles",
      "5 knowledge base docs",
      "Full AI analysis & match scoring",
      "3 cover letter variants",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 39,
    period: "month",
    proposals_limit: 100,
    highlighted: true,
    features: [
      "100 proposals per week",
      "10 specialized profiles",
      "Unlimited knowledge base docs",
      "Full AI analysis & match scoring",
      "3 cover letter variants",
      "Proposal Assistant chat",
      "Priority GPT-4o processing",
    ],
  },
  {
    id: "power",
    name: "Power",
    price: 79,
    period: "month",
    proposals_limit: 250,
    features: [
      "250 proposals per week",
      "Unlimited profiles",
      "Unlimited documents",
      "Advanced AI analysis",
      "Proposal Assistant chat",
      "Priority queue",
    ],
  },
  {
    id: "pro",
    name: "Pro VIP",
    price: 149,
    period: "month",
    proposals_limit: -1,
    features: [
      "Unlimited proposals",
      "Unlimited profiles",
      "Unlimited documents",
      "Full AI analysis & chat assistant",
      "Dedicated account manager",
      "24/7 priority support",
    ],
  },
];

// Initial Chat
export const mockChatMessages: ChatMessage[] = [];

// Popular Skills for Suggestions
export const popularSkills = [
  "React", "Next.js", "TypeScript", "Node.js", "Python", "FastAPI", "LangChain",
  "LangGraph", "Supabase", "PostgreSQL", "Tailwind CSS", "OpenAI API",
  "Docker", "AWS", "UI/UX Design", "GraphQL", "pgvector", "Machine Learning"
];
