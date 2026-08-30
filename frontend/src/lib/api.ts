// ============================================================================
// BidLens — API Client & SSE Stream Helpers
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOpts.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOpts,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail || res.statusText, body);
  }

  return res.json();
}

// --- SSE Stream Helper ---
export async function* streamSSE(
  endpoint: string,
  body: unknown,
  token?: string
): AsyncGenerator<{ type: string; data: string }> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new ApiError(res.status, "Stream failed");
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        try {
          const parsed = JSON.parse(data);
          yield parsed;
        } catch {
          yield { type: "token", data };
        }
      }
    }
  }
}

// --- Auth ---
export const authApi = {
  syncSignup: (data: { id?: string; email: string; full_name: string; tier?: string }) =>
    fetchApi<{ status: string; user: any }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// --- Billing ---
export const billingApi = {
  getUsage: (token: string) =>
    fetchApi<{
      tier: string;
      tier_name: string;
      price_monthly: number;
      proposals_used: number;
      proposals_limit: number;
      tokens_used: number;
      token_limit: number;
      prompt_tokens: number;
      completion_tokens: number;
      assigned_model: string;
      status: string;
    }>("/billing/usage", { token }),

  upgrade: (tier: string, token: string) =>
    fetchApi<{
      tier: string;
      tier_name: string;
      price_monthly: number;
      proposals_used: number;
      proposals_limit: number;
      tokens_used: number;
      token_limit: number;
      prompt_tokens: number;
      completion_tokens: number;
      assigned_model: string;
      status: string;
    }>("/billing/upgrade", {
      method: "POST",
      body: JSON.stringify({ tier }),
      token,
    }),
};

// --- Profiles ---
export const profilesApi = {
  list: (token: string) =>
    fetchApi<import("./types").Profile[]>("/profiles", { token }),

  get: (id: string, token: string) =>
    fetchApi<import("./types").Profile>(`/profiles/${id}`, { token }),

  create: (data: import("./types").ProfileFormData, token: string) =>
    fetchApi<import("./types").Profile>("/profiles", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  update: (id: string, data: Partial<import("./types").ProfileFormData>, token: string) =>
    fetchApi<import("./types").Profile>(`/profiles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: string, token: string) =>
    fetchApi<void>(`/profiles/${id}`, { method: "DELETE", token }),

  setDefault: (id: string, token: string) =>
    fetchApi<import("./types").Profile>(`/profiles/${id}/set-default`, {
      method: "POST",
      token,
    }),
};

// --- Knowledge Base ---
export const knowledgeApi = {
  list: (token: string) =>
    fetchApi<import("./types").KnowledgeDocument[]>("/knowledge", { token }),

  stats: (token: string) =>
    fetchApi<import("./types").KnowledgeBaseStats>("/knowledge/stats", { token }),

  upload: async (file: File, token: string) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/knowledge/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(res.status, body.detail || "Upload failed", body);
    }

    return res.json() as Promise<import("./types").KnowledgeDocument>;
  },

  delete: (id: string, token: string) =>
    fetchApi<void>(`/knowledge/${id}`, { method: "DELETE", token }),
};

// --- Jobs ---
export const jobsApi = {
  list: (token: string) =>
    fetchApi<import("./types").Job[]>("/jobs", { token }),

  get: (id: string, token: string) =>
    fetchApi<import("./types").Job>(`/jobs/${id}`, { token }),

  create: (data: {
    job_description_raw: string;
    profile_id: string;
    document_ids: string[];
  }, token: string) =>
    fetchApi<import("./types").Job>("/jobs", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),
};

// --- Proposals ---
export const proposalsApi = {
  get: (jobId: string, token: string) =>
    fetchApi<import("./types").Proposal>(`/proposals/${jobId}`, { token }),

  regenerate: (jobId: string, token: string) =>
    fetchApi<import("./types").Proposal>(`/proposals/${jobId}/regenerate`, {
      method: "POST",
      token,
    }),

  quickAction: (
    jobId: string,
    action: string,
    variant: string,
    token: string
  ) =>
    fetchApi<{ content: string }>(`/proposals/${jobId}/quick-action`, {
      method: "POST",
      body: JSON.stringify({ action, variant }),
      token,
    }),
};

// --- Chat ---
export const chatApi = {
  stream: (data: import("./types").ChatRequest, token?: string) =>
    streamSSE("/chat/stream", data, token),
};

// --- Dashboard ---
export const dashboardApi = {
  stats: (token: string) =>
    fetchApi<import("./types").DashboardStats>("/dashboard/stats", { token }),
};

// --- Super Admin ---
export const adminApi = {
  getStats: (token: string) =>
    fetchApi<{
      total_users: number;
      active_subscribers: number;
      mrr_usd: number;
      total_proposals: number;
      total_documents: number;
      total_vectors: number;
      total_llm_tokens: number;
      avg_latency_sec: number;
    }>("/admin/stats", { token }),

  listUsers: (params: { search?: string; tier?: string; status?: string } = {}, token: string) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.tier) query.set("tier", params.tier);
    if (params.status) query.set("status", params.status);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return fetchApi<{
      users: Array<{
        id: string;
        email: string;
        full_name: string;
        role: string;
        tier: string;
        status: string;
        proposals_used: number;
        proposals_limit: number;
        created_at: string;
        last_active: string;
      }>;
      total: number;
    }>(`/admin/users${qs}`, { token });
  },

  createUser: (
    data: {
      email: string;
      full_name: string;
      password?: string;
      tier?: string;
      proposals_limit?: number;
      role?: string;
      assigned_model?: string;
    },
    token: string
  ) =>
    fetchApi<any>("/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  updateUser: (
    userId: string,
    data: {
      tier?: string;
      status?: string;
      assigned_model?: string;
      proposals_limit?: number;
      proposals_used?: number;
      tokens_used?: number;
      role?: string;
    },
    token: string
  ) =>
    fetchApi<any>(`/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  deleteUser: (userId: string, token: string) =>
    fetchApi<void>(`/admin/users/${userId}`, { method: "DELETE", token }),

  getModels: (token: string) =>
    fetchApi<{
      models: Array<{
        id: string;
        name: string;
        provider: string;
        badge: string;
        description: string;
      }>;
      default_model: string;
    }>("/admin/models", { token }),

  updateDefaultModel: (model: string, token: string) =>
    fetchApi<{ status: string; default_model: string }>(
      `/admin/models/default?model=${encodeURIComponent(model)}`,
      {
        method: "PUT",
        token,
      }
    ),

  getActivity: (token: string) =>
    fetchApi<
      Array<{
        id: string;
        user_email: string;
        job_title: string;
        model: string;
        status: string;
        tokens: number;
        cost_usd: number;
        latency_sec: number;
        timestamp: string;
        variants_generated: number;
      }>
    >("/admin/activity", { token }),
};

export { ApiError };

