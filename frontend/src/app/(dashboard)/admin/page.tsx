"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  TrendingUp,
  Cpu,
  Coins,
  Shield,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  Activity,
  Layers,
  Database,
  Server,
  Zap,
  Loader2,
  Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";
import { adminApi } from "@/lib/api";
import { ConfirmationModal } from "@/components/confirmation-modal";

export interface SupportedModel {
  id: string;
  name: string;
  provider: "openai" | "google" | "groq";
  badge: string;
  description: string;
}

export const MODEL_OPTIONS: SupportedModel[] = [
  {
    id: "gpt-4o",
    name: "OpenAI GPT-4o",
    provider: "openai",
    badge: "Flagship",
    description: "Deep reasoning and high-accuracy structured proposals",
  },
  {
    id: "gpt-4o-mini",
    name: "OpenAI GPT-4o Mini",
    provider: "openai",
    badge: "Cost Efficient",
    description: "Ultra-fast and economical proposal generation",
  },
  {
    id: "gemini-3.6-flash",
    name: "Google Gemini 3.6 Flash",
    provider: "google",
    badge: "Ultra Fast",
    description: "High-speed Google multimodal engine with sub-second latency",
  },
  {
    id: "gemini-3.6-pro",
    name: "Google Gemini 3.6 Pro",
    provider: "google",
    badge: "Deep Reasoning",
    description: "Advanced architectural and technical problem analysis",
  },
  {
    id: "qwen/qwen3.8-27b",
    name: "Groq Qwen 3.8 27B",
    provider: "groq",
    badge: "LPU Speed",
    description: "High-throughput inference on ultra-fast Groq hardware",
  },
  {
    id: "openai/gpt-oss-120b",
    name: "Groq GPT-OSS 120B",
    provider: "groq",
    badge: "Open Source",
    description: "Open-weights intelligence with high token generation speeds",
  },
];

interface UserItem {
  id: string;
  email: string;
  full_name: string;
  role: string;
  tier: string;
  status: string;
  assigned_model?: string;
  proposals_used: number;
  proposals_limit: number;
  tokens_used: number;
  estimated_cost_usd: number;
  created_at: string;
  last_active: string;
}

interface ActivityItem {
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
}

const mockInitialUsers: UserItem[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    email: "dev@sakarsa.com",
    full_name: "Sakarsa Super Admin",
    role: "admin",
    tier: "pro",
    status: "active",
    assigned_model: "gpt-4o",
    proposals_used: 0,
    proposals_limit: -1,
    tokens_used: 0,
    estimated_cost_usd: 0.0,
    created_at: "2026-01-01T00:00:00Z",
    last_active: "Just now",
  },
];

const mockInitialActivity: ActivityItem[] = [];

function getTierBadge(tier: string) {
  switch (tier.toLowerCase()) {
    case "pro":
      return (
        <Badge className="bg-primary/15 text-primary border-primary/30 uppercase text-[10px] font-bold">
          PRO VIP
        </Badge>
      );
    case "power":
      return (
        <Badge className="bg-sky-500/15 text-sky-400 border-sky-500/30 uppercase text-[10px] font-bold">
          POWER
        </Badge>
      );
    case "growth":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 uppercase text-[10px] font-bold">
          GROWTH
        </Badge>
      );
    case "starter":
      return (
        <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 uppercase text-[10px] font-bold">
          STARTER
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border uppercase text-[10px]">
          FREE
        </Badge>
      );
  }
}

function getModelBadge(modelId: string = "gpt-4o") {
  if (modelId.includes("gemini")) {
    return (
      <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/30 font-mono text-[10px] font-semibold">
        ✨ {modelId.replace("gemini-", "Gemini ")}
      </Badge>
    );
  } else if (modelId.includes("qwen") || modelId.includes("gpt-oss")) {
    return (
      <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 font-mono text-[10px] font-semibold">
        ⚡ {modelId.includes("qwen") ? "Groq Qwen" : "Groq OSS"}
      </Badge>
    );
  }
  return (
    <Badge className="bg-primary/15 text-primary border-primary/30 font-mono text-[10px] font-semibold">
      🤖 {modelId.toUpperCase()}
    </Badge>
  );
}

export default function SuperAdminPage() {
  const { token } = useAuth();
  
  const [stats, setStats] = useState({
    total_users: 1,
    active_subscribers: 0,
    mrr_usd: 0,
    total_proposals: 0,
    total_documents: 0,
    total_vectors: 0,
    total_tokens_used: 0,
    total_cost_usd: 0.0,
    avg_latency_sec: 0.0,
  });

  const [users, setUsers] = useState<UserItem[]>(mockInitialUsers);
  const [activity, setActivity] = useState<ActivityItem[]>(mockInitialActivity);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [defaultModel, setDefaultModel] = useState("gpt-4o");
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingGlobalModel, setIsSavingGlobalModel] = useState(false);

  // Edit User Modal State
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [editTier, setEditTier] = useState("growth");
  const [editQuota, setEditQuota] = useState(100);
  const [editStatus, setEditStatus] = useState("active");
  const [editModel, setEditModel] = useState("gpt-4o");
  const [isUpdating, setIsUpdating] = useState(false);

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("password123");
  const [newUserTier, setNewUserTier] = useState("free");
  const [newUserModel, setNewUserModel] = useState("gpt-4o");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const loadAdminData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [statsData, usersData, actData, modelsData] = await Promise.all([
        adminApi.getStats(token).catch(() => null),
        adminApi.listUsers({ search: searchQuery, tier: tierFilter, status: statusFilter }, token).catch(() => null),
        adminApi.getActivity(token).catch(() => null),
        adminApi.getModels(token).catch(() => null),
      ]);

      if (statsData) setStats(statsData as any);
      if (usersData && usersData.users) setUsers(usersData.users as any);
      if (actData) setActivity(actData);
      if (modelsData && modelsData.default_model) setDefaultModel(modelsData.default_model);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [token, searchQuery, tierFilter, statusFilter]);

  const handleOpenEdit = (user: UserItem) => {
    setSelectedUser(user);
    setEditTier(user.tier);
    setEditQuota(user.proposals_limit);
    setEditStatus(user.status);
    setEditModel(user.assigned_model || defaultModel);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setIsUpdating(true);
    try {
      if (token) {
        await adminApi.updateUser(
          selectedUser.id,
          {
            tier: editTier,
            proposals_limit: editQuota,
            status: editStatus,
            assigned_model: editModel,
          },
          token
        ).catch(() => null);
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                tier: editTier,
                proposals_limit: editQuota,
                status: editStatus,
                assigned_model: editModel,
              }
            : u
        )
      );

      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to update user:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    try {
      const tierQuotas: Record<string, number> = {
        free: 3,
        starter: 25,
        growth: 100,
        power: 250,
        pro: -1,
      };

      if (token) {
        const created = await adminApi.createUser(
          {
            email: newUserEmail,
            full_name: newUserName,
            password: newUserPassword,
            tier: newUserTier,
            proposals_limit: tierQuotas[newUserTier] ?? 3,
            assigned_model: newUserModel,
          },
          token
        );

        if (created) {
          setUsers((prev) => [created, ...prev]);
        }
      } else {
        const localNew: UserItem = {
          id: `usr-${Date.now()}`,
          email: newUserEmail,
          full_name: newUserName,
          role: "user",
          tier: newUserTier,
          status: "active",
          assigned_model: newUserModel,
          proposals_used: 0,
          proposals_limit: tierQuotas[newUserTier] ?? 3,
          tokens_used: 0,
          estimated_cost_usd: 0.0,
          created_at: new Date().toISOString(),
          last_active: "Never",
        };
        setUsers((prev) => [localNew, ...prev]);
      }

      setIsAddUserOpen(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("password123");
      setAddUserError(null);
    } catch (err: any) {
      setAddUserError(err.message || "Failed to create user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      if (token) {
        await adminApi.deleteUser(userToDelete.id, token).catch(() => null);
      }
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleSaveGlobalModel = async (newModel: string) => {
    setDefaultModel(newModel);
    if (!token) return;
    setIsSavingGlobalModel(true);
    try {
      await adminApi.updateDefaultModel(newModel, token);
    } catch (err) {
      console.error("Failed to update global model:", err);
    } finally {
      setIsSavingGlobalModel(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTier = tierFilter === "all" || u.tier.toLowerCase() === tierFilter.toLowerCase();
    const matchStatus = statusFilter === "all" || u.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchTier && matchStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Super Admin Banner Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-sm">
                <Shield className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Super Admin Command Center
              </h1>
              <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] font-bold uppercase">
                dev@sakarsa.com
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Multi-model management (OpenAI GPT-4o, Google Gemini, Groq), account provisioning, quota overrides, and LLM token audit.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsAddUserOpen(true)}
              className="bg-primary hover:opacity-90 text-white font-semibold h-9 text-xs gap-1.5 shadow-md cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              + Add New User
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAdminData}
              disabled={isLoading}
              className="h-9 gap-1.5 text-xs border-border text-foreground hover:bg-accent cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card className="border border-border/70 bg-card hover:border-primary/40 transition-all shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Managed Users
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-foreground">
                {stats.total_users}
              </span>
              <span className="text-xs text-primary font-medium flex items-center">
                ↗ 100% Online
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {stats.active_subscribers} paid subscription accounts
            </p>
          </CardContent>
        </Card>

        {/* Total Tokens Used */}
        <Card className="border border-border/70 bg-card hover:border-primary/40 transition-all shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total LLM Tokens
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-primary">
                {(stats.total_tokens_used / 1000).toFixed(1)}k
              </span>
              <span className="text-xs text-muted-foreground">tokens</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Across all user generation calls
            </p>
          </CardContent>
        </Card>

        {/* Total Cost USD */}
        <Card className="border border-border/70 bg-card hover:border-primary/40 transition-all shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                LLM API Cost ($USD)
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Coins className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-foreground">
                ${stats.total_cost_usd.toFixed(2)}
              </span>
              <span className="text-[11px] text-primary">Blended rates</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Calculated on multi-provider consumption
            </p>
          </CardContent>
        </Card>

        {/* MRR */}
        <Card className="border border-border/70 bg-card hover:border-primary/40 transition-all shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Monthly Revenue (MRR)
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-foreground">
                ${stats.mrr_usd}
              </span>
              <span className="text-xs text-muted-foreground">USD/mo</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Active subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-card border border-border/70 p-1">
          <TabsTrigger value="users" className="gap-2 text-xs">
            <Users className="h-3.5 w-3.5 text-primary" />
            User Management & Model Assignments ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2 text-xs">
            <Activity className="h-3.5 w-3.5 text-sky-400" />
            AI Execution Logs
          </TabsTrigger>
          <TabsTrigger value="infrastructure" className="gap-2 text-xs">
            <Server className="h-3.5 w-3.5 text-indigo-400" />
            System & Multi-Model Config
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: User Management */}
        <TabsContent value="users" className="space-y-4 mt-0">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search user by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-background text-foreground border-border text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={tierFilter} onValueChange={(v) => setTierFilter(v ?? "all")}>
                <SelectTrigger className="w-[130px] h-9 text-xs bg-background text-foreground border-border">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="power">Power</SelectItem>
                  <SelectItem value="pro">Pro VIP</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
                <SelectTrigger className="w-[130px] h-9 text-xs bg-background text-foreground border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <Card className="border border-border/70 overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs uppercase font-semibold">User</TableHead>
                  <TableHead className="text-xs uppercase font-semibold">Plan Tier</TableHead>
                  <TableHead className="text-xs uppercase font-semibold">Assigned AI Model</TableHead>
                  <TableHead className="text-xs uppercase font-semibold">Proposal Quota</TableHead>
                  <TableHead className="text-xs uppercase font-semibold">Tokens Used</TableHead>
                  <TableHead className="text-xs uppercase font-semibold">Cost ($USD)</TableHead>
                  <TableHead className="text-xs uppercase font-semibold">Status</TableHead>
                  <TableHead className="text-xs uppercase font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                      No matching user accounts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const initials = user.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    const quotaPercent =
                      user.proposals_limit > 0
                        ? Math.min(100, Math.round((user.proposals_used / user.proposals_limit) * 100))
                        : 0;

                    return (
                      <TableRow key={user.id} className="border-border/50 hover:bg-accent/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-border">
                              <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                                {initials || "BL"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm text-foreground">
                                  {user.full_name}
                                </span>
                                {user.role === "admin" && (
                                  <Badge className="bg-primary/15 text-primary border-primary/30 text-[9px] px-1 py-0 font-bold">
                                    SUPER ADMIN
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground font-mono">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>{getTierBadge(user.tier)}</TableCell>

                        {/* Assigned Model */}
                        <TableCell>{getModelBadge(user.assigned_model || defaultModel)}</TableCell>

                        <TableCell>
                          <div className="space-y-1 max-w-[120px]">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-mono">{user.proposals_used}</span>
                              <span className="text-muted-foreground">
                                / {user.proposals_limit === -1 ? "∞" : user.proposals_limit}
                              </span>
                            </div>
                            <Progress value={quotaPercent} className="h-1.5" />
                          </div>
                        </TableCell>

                        {/* Tokens Used */}
                        <TableCell>
                          <span className="font-mono text-xs text-primary font-semibold">
                            {(user.tokens_used / 1000).toFixed(1)}k
                          </span>
                        </TableCell>

                        {/* Cost in USD */}
                        <TableCell>
                          <span className="font-mono text-xs font-semibold text-foreground">
                            ${user.estimated_cost_usd.toFixed(3)}
                          </span>
                        </TableCell>

                        <TableCell>
                          {user.status === "active" ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1 text-[11px]">
                              <CheckCircle2 className="h-3 w-3" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30 gap-1 text-[11px]">
                              <XCircle className="h-3 w-3" /> Suspended
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(user)}
                              className="h-8 gap-1 text-xs text-muted-foreground hover:text-primary cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Manage
                            </Button>
                            {user.role !== "admin" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setUserToDelete(user)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* TAB 2: AI Execution Logs */}
        <TabsContent value="activity" className="space-y-4 mt-0">
          <Card className="border border-border/70 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-foreground">
                <Activity className="h-4 w-4 text-sky-400" />
                Live LangGraph AI Execution Feed
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Real-time stream of multi-agent state machines, pgvector retrievals, and proposal token telemetry.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/40 text-muted-foreground mb-3">
                    <Activity className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No recent AI executions</p>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Telemetry logs will automatically populate when users analyze job postings or request proposal revisions.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-background/50 text-xs hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{item.job_title}</p>
                          <p className="text-[11px] text-muted-foreground">{item.user_email} · {item.model}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-primary">{item.tokens} tokens</span>
                        <span className="font-mono text-foreground">${item.cost_usd.toFixed(4)}</span>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: System & Multi-Model Config */}
        <TabsContent value="infrastructure" className="space-y-6 mt-0">
          {/* Global Default AI Model Selection */}
          <Card className="border border-border/70 bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2 text-foreground">
                <Bot className="h-4 w-4 text-primary" />
                Global AI Engine & Model Routing
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Select the primary default LLM engine used for new users and automated background agents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MODEL_OPTIONS.map((m) => {
                  const isSelected = defaultModel === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSaveGlobalModel(m.id)}
                      className={`flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border hover:border-border hover:bg-accent/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm text-foreground">{m.name}</span>
                        <Badge className={`text-[9px] uppercase font-bold ${
                          m.provider === "google"
                            ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                            : m.provider === "groq"
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : "bg-primary/15 text-primary border-primary/30"
                        }`}>
                          {m.badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{m.description}</p>
                      {isSelected && (
                        <div className="mt-3 flex items-center gap-1 text-[11px] text-primary font-bold">
                          <CheckCircle2 className="h-3 w-3" /> System Default Active
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Provider Health Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border border-border/70 bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground">OpenAI API</CardTitle>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                    Connected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs text-muted-foreground">
                <p>Models: GPT-4o, GPT-4o Mini</p>
                <p>Embeddings: text-embedding-3-small (1536d)</p>
                <p className="text-primary font-mono text-[11px]">Key: sk-proj-...Active</p>
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground">Google Gemini</CardTitle>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                    Connected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs text-muted-foreground">
                <p>Models: Gemini 3.6 Flash, Gemini 3.6 Pro</p>
                <p>Features: 1M Token Context & High Speed</p>
                <p className="text-indigo-400 font-mono text-[11px]">Key: AQ.Ab8R...Active</p>
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground">Groq LPU Engine</CardTitle>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                    Connected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs text-muted-foreground">
                <p>Models: Qwen 3.8 27B, GPT-OSS 120B</p>
                <p>Throughput: ~300 tokens/second</p>
                <p className="text-amber-400 font-mono text-[11px]">Key: gsk_8VVa...Active</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add New User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="w-full max-w-md border border-border/80 bg-card shadow-2xl">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-base flex items-center gap-2 text-foreground">
                <UserPlus className="h-4 w-4 text-primary" />
                Create New User Account
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Provision a new user account with assigned plan tier and AI model engine.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateUser}>
              <CardContent className="space-y-4 pt-5">
                {addUserError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{addUserError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs text-foreground font-medium">Full Name</Label>
                  <Input
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                    placeholder="e.g. Jordan Hayes"
                    className="h-10 bg-background border-border text-foreground text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-foreground font-medium">Email Address</Label>
                  <Input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                    placeholder="jordan@agency.com"
                    className="h-10 bg-background border-border text-foreground text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-foreground font-medium">Temporary Password</Label>
                  <Input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                    placeholder="password123"
                    className="h-10 bg-background border-border text-foreground text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-foreground font-medium">Subscription Tier</Label>
                  <Select value={newUserTier} onValueChange={(v) => setNewUserTier(v ?? "free")}>
                    <SelectTrigger className="h-10 bg-background text-xs text-foreground border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free (3 proposals/wk)</SelectItem>
                      <SelectItem value="starter">Starter ($19/mo · 25 proposals/wk)</SelectItem>
                      <SelectItem value="growth">Growth ($39/mo · 100 proposals/wk)</SelectItem>
                      <SelectItem value="power">Power ($79/mo · 250 proposals/wk)</SelectItem>
                      <SelectItem value="pro">Pro VIP ($149/mo · Unlimited)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-foreground font-medium">Assigned AI Model</Label>
                  <Select value={newUserModel} onValueChange={(v) => setNewUserModel(v ?? "gpt-4o")}>
                    <SelectTrigger className="h-10 bg-background text-xs text-foreground border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODEL_OPTIONS.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} ({m.badge})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddUserOpen(false);
                      setAddUserError(null);
                    }}
                    className="cursor-pointer text-xs border-border"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreatingUser}
                    className="bg-primary hover:opacity-90 text-white gap-1.5 cursor-pointer text-xs font-semibold shadow-md"
                  >
                    {isCreatingUser ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Create Account
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* Edit User Modal / Dialog Overlay */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="w-full max-w-lg border border-border/80 bg-card shadow-2xl">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-base flex items-center justify-between text-foreground">
                <span className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" />
                  Manage User Account & AI Model
                </span>
                <Badge variant="outline" className="font-mono text-xs border-border">
                  {selectedUser.id.slice(0, 8)}...
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Adjust subscription tier, quota limits, and AI model for <strong>{selectedUser.email}</strong>.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-5">
              <div className="space-y-2">
                <Label className="text-xs text-foreground font-medium">User Full Name</Label>
                <Input value={selectedUser.full_name} disabled className="bg-background text-xs text-muted-foreground border-border" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-foreground font-medium">Assigned AI Model Engine</Label>
                <Select value={editModel} onValueChange={(v) => setEditModel(v ?? "gpt-4o")}>
                  <SelectTrigger className="h-9 text-xs bg-background text-foreground border-border font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_OPTIONS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} ({m.badge})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">
                  Proposals and chat for this user will run directly through this model engine.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-foreground font-medium">Subscription Tier</Label>
                <Select value={editTier} onValueChange={(v) => setEditTier(v ?? "growth")}>
                  <SelectTrigger className="h-9 text-xs bg-background text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free (3 proposals/wk)</SelectItem>
                    <SelectItem value="starter">Starter ($19/mo · 25 proposals/wk)</SelectItem>
                    <SelectItem value="growth">Growth ($39/mo · 100 proposals/wk)</SelectItem>
                    <SelectItem value="power">Power ($79/mo · 250 proposals/wk)</SelectItem>
                    <SelectItem value="pro">Pro VIP ($149/mo · Unlimited)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-foreground font-medium">Weekly Proposal Limit</Label>
                  <span className="text-xs font-mono text-primary font-bold">
                    {editQuota === -1 ? "Unlimited" : `${editQuota} proposals`}
                  </span>
                </div>
                <Input
                  type="number"
                  value={editQuota}
                  onChange={(e) => setEditQuota(parseInt(e.target.value) || 0)}
                  className="h-9 text-xs font-mono bg-background text-foreground border-border"
                />
                <p className="text-[10px] text-muted-foreground">
                  Set to -1 for unlimited proposals.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                <div>
                  <p className="text-xs font-medium text-foreground">Account Access Status</p>
                  <p className="text-[10px] text-muted-foreground">
                    {editStatus === "active" ? "User can sign in and generate proposals" : "Account suspended"}
                  </p>
                </div>
                <Switch
                  checked={editStatus === "active"}
                  onCheckedChange={(checked) => setEditStatus(checked ? "active" : "suspended")}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                  className="cursor-pointer text-xs border-border"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveUser}
                  disabled={isUpdating}
                  className="bg-primary hover:opacity-90 text-white gap-1.5 cursor-pointer text-xs font-semibold shadow-md"
                >
                  {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modern Custom Delete User Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDeleteUser}
        isLoading={isDeletingUser}
        title="Delete User Account"
        description={`Are you sure you want to permanently delete "${userToDelete?.full_name}" (${userToDelete?.email})? All associated jobs, profiles, and tokens will be permanently purged.`}
        confirmText="Delete User"
        variant="danger"
      />
    </div>
  );
}
