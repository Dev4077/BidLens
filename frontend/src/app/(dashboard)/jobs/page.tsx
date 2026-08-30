"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Plus,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockJobs } from "@/lib/mock-data";
import { jobsApi } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import type { Job } from "@/lib/types";

function getStatusConfig(status: string) {
  switch (status) {
    case "completed":
      return {
        icon: CheckCircle2,
        label: "Completed",
        className: "bg-neon/15 text-neon border-neon/20",
      };
    case "analyzing":
      return {
        icon: Sparkles,
        label: "Analyzing",
        className: "bg-blue-400/15 text-blue-400 border-blue-400/20",
      };
    case "pending":
      return {
        icon: Clock,
        label: "Pending",
        className: "bg-amber-400/15 text-amber-400 border-amber-400/20",
      };
    default:
      return {
        icon: AlertCircle,
        label: "Failed",
        className: "bg-destructive/15 text-destructive border-destructive/20",
      };
  }
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    async function loadJobs() {
      if (!token) return;
      try {
        const data = await jobsApi.list(token).catch(() => mockJobs);
        if (data && data.length > 0) {
          setJobs(data);
        }
      } catch (error) {
        console.error("Failed to load jobs:", error);
        setJobs(mockJobs);
      } finally {
        setIsLoading(false);
      }
    }
    loadJobs();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage all your analyzed job postings and generated proposals.
          </p>
        </div>
        <Link href="/jobs/new">
          <Button className="bg-gradient-neon hover:opacity-90 text-white gap-2 shadow-lg shadow-neon/20 cursor-pointer">
            <Plus className="h-4 w-4" />
            New Proposal
          </Button>
        </Link>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {jobs.map((job) => {
          const status = getStatusConfig(job.status);
          const StatusIcon = status.icon;
          const title =
            job.job_description_raw.split("\n")[0]?.trim() || "Untitled Job";
          const preview = job.job_description_raw
            .split("\n")
            .slice(1, 4)
            .join(" ")
            .trim()
            .slice(0, 150);

          return (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="group border-border/50 hover:border-border bg-card hover:bg-accent/20 transition-all duration-200 cursor-pointer mb-3">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent mt-0.5">
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold group-hover:text-neon transition-colors truncate">
                          {title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {preview}...
                        </p>
                        <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{job.profile?.profile_name || "Specialist Profile"}</span>
                          <span>·</span>
                          <span>
                            {new Date(job.created_at).toLocaleDateString(
                              "en-US",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                          {job.document_ids && job.document_ids.length > 0 && (
                            <>
                              <span>·</span>
                              <span>
                                {job.document_ids.length} doc
                                {job.document_ids.length > 1 ? "s" : ""} attached
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        variant="outline"
                        className={`${status.className} gap-1 text-xs`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Briefcase className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No jobs yet</p>
            <p className="text-sm mt-1">
              Create your first proposal to get started.
            </p>
            <Link href="/jobs/new" className="mt-4">
              <Button className="bg-gradient-neon text-white gap-2 cursor-pointer">
                <Plus className="h-4 w-4" />
                New Proposal
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
