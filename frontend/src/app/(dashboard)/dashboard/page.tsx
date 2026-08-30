"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  FileText,
  TrendingUp,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockDashboardStats, mockJobs } from "@/lib/mock-data";
import { jobsApi } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import type { Job } from "@/lib/types";

function getStatusConfig(status: string) {
  switch (status) {
    case "completed":
      return {
        icon: CheckCircle2,
        label: "Completed",
        className: "bg-neon/15 text-neon border-neon/30",
      };
    case "analyzing":
      return {
        icon: Sparkles,
        label: "Analyzing",
        className: "bg-blue-400/15 text-blue-400 border-blue-400/30",
      };
    case "pending":
      return {
        icon: Clock,
        label: "Pending",
        className: "bg-amber-400/15 text-amber-400 border-amber-400/30",
      };
    default:
      return {
        icon: AlertCircle,
        label: "Failed",
        className: "bg-destructive/15 text-destructive border-destructive/30",
      };
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isAdmin } = useAuth();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If Super Admin, automatically redirect to the Super Admin Command Center
    if (isAdmin) {
      router.replace("/admin");
      return;
    }

    async function loadData() {
      if (!token) return;
      try {
        const jobs = await jobsApi.list(token).catch(() => []);
        setRecentJobs(jobs || []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setRecentJobs([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [token, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Freelancer";

  const statsCards = [
    {
      title: "Total Jobs Analyzed",
      value: recentJobs.length,
      icon: Briefcase,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      trend: "Total submissions",
    },
    {
      title: "Proposals Generated",
      value: recentJobs.filter((j) => j.status === "completed").length,
      icon: FileText,
      color: "text-neon",
      bgColor: "bg-neon/10",
      trend: "Ready to send",
    },
    {
      title: "Avg Match Score",
      value: recentJobs.length > 0 ? "88%" : "0%",
      icon: TrendingUp,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      trend: "AI alignment",
    },
    {
      title: "Tokens Used",
      value: recentJobs.length > 0 ? `${(recentJobs.length * 3.8).toFixed(1)}k` : "0k",
      icon: Zap,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      trend: "of 50k monthly",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-8 shadow-xl">
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome,{" "}
            <span className="text-primary">{userName}</span>
          </h1>
          <p className="mt-2 text-muted-foreground max-w-lg text-sm">
            Analyze job postings with LangGraph, match your skills via RAG vector context, and generate winning proposals in seconds.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link href="/jobs/new">
              <Button className="bg-primary hover:opacity-90 text-white font-semibold gap-2 h-11 px-6 shadow-md cursor-pointer">
                <Sparkles className="h-4 w-4" />
                New Proposal
              </Button>
            </Link>
            <Link href="/knowledge-base">
              <Button variant="outline" className="h-11 gap-2 cursor-pointer border-border text-foreground hover:bg-accent">
                Upload Case Studies
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card
            key={stat.title}
            className="group relative overflow-hidden border-border/50 bg-card hover:border-neon/40 transition-all duration-300 hover:shadow-lg"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.trend}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgColor}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Progress */}
      <Card className="border-border/50 bg-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-white">Weekly Proposal Allowance</p>
              <p className="text-xs text-muted-foreground">
                {recentJobs.length} of 3 proposals used this week (Free Tier)
              </p>
            </div>
            <Link href="/billing">
              <Button variant="ghost" size="sm" className="text-neon hover:text-neon/80 h-8 text-xs cursor-pointer">
                Upgrade Plan
              </Button>
            </Link>
          </div>
          <Progress value={Math.min(100, (recentJobs.length / 3) * 100)} className="h-2" />
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Proposals</h2>
          {recentJobs.length > 0 && (
            <Link href="/jobs">
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1 h-8 cursor-pointer">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>

        {recentJobs.length === 0 ? (
          <Card className="border-border/50 bg-card p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neon/10 text-neon mb-3">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No Proposals Generated Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-5">
              Paste your first freelance job posting to generate tailored, high-converting proposals.
            </p>
            <Link href="/jobs/new">
              <Button className="bg-gradient-neon hover:opacity-95 text-white gap-2 h-10 px-5 shadow-md shadow-neon/30 cursor-pointer">
                <Plus className="h-4 w-4" />
                Generate Your First Proposal
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentJobs.slice(0, 5).map((job) => {
              const status = getStatusConfig(job.status);
              const StatusIcon = status.icon;
              const title =
                job.job_description_raw.split("\n")[0]?.trim() || "Untitled Job";

              return (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <Card className="group border-border/50 hover:border-neon/40 bg-card hover:bg-accent/20 transition-all duration-200 cursor-pointer mb-3">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neon/10 text-neon">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium group-hover:text-neon transition-colors text-white">
                            {title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(job.created_at).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={`${status.className} gap-1 text-xs`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
