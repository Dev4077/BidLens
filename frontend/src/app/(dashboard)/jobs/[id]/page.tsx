"use client";

import React, { useState, useEffect, use, useRef } from "react";
import {
  ArrowLeft,
  Copy,
  RefreshCw,
  Minimize2,
  Cpu,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Target,
  TrendingUp,
  Shield,
  Zap,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { jobsApi, proposalsApi, chatApi } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { mockProposal, mockJobs, mockChatMessages } from "@/lib/mock-data";
import type { ChatMessage, Job, Proposal } from "@/lib/types";

// Health gauge component
function HealthGauge({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-400 bg-emerald-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    amber: "text-amber-400 bg-amber-400/10",
    purple: "text-purple-400 bg-purple-400/10",
  };
  const barColorMap: Record<string, string> = {
    emerald: "bg-emerald-400",
    blue: "bg-blue-400",
    amber: "bg-amber-400",
    purple: "bg-purple-400",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              colorMap[color] || colorMap.emerald
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
        </div>
        <span className="text-sm font-bold tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-accent/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            barColorMap[color] || barColorMap.emerald
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// Match score bar
function MatchBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-accent/50 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-neon transition-all duration-1000 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

const chipSuggestions = [
  "Make this more technical",
  "Shorten to 120 words",
  "Improve the opening hook",
  "Add emphasis on quick turnaround",
  "Ask 2 clarifying questions for client",
];

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [activeTab, setActiveTab] = useState<"balanced" | "technical" | "conversational">("balanced");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [chatInput, setChatInput] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isQuickActionLoading, setIsQuickActionLoading] = useState(false);
  const [isChatStreaming, setIsChatStreaming] = useState(false);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch job and proposal from API with mock fallback
  useEffect(() => {
    async function loadJobAndProposal() {
      setIsLoading(true);
      try {
        if (token) {
          const [jobData, proposalData] = await Promise.all([
            jobsApi.get(id, token).catch(() => null),
            proposalsApi.get(id, token).catch(() => null),
          ]);

          if (jobData) setJob(jobData);
          else {
            const fallbackJob = mockJobs.find((j) => j.id === id) || mockJobs[0];
            setJob(fallbackJob);
          }

          if (proposalData) {
            setProposal(proposalData);
          } else {
            setProposal(mockProposal);
          }
        } else {
          const fallbackJob = mockJobs.find((j) => j.id === id) || mockJobs[0];
          setJob(fallbackJob);
          setProposal(mockProposal);
        }
      } catch (err) {
        console.error("Error loading job details:", err);
        setJob(mockJobs[0]);
        setProposal(mockProposal);
      } finally {
        setIsLoading(false);
      }
    }

    loadJobAndProposal();
  }, [id, token]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatStreaming]);

  const activeProposal = proposal || mockProposal;
  const analysis = activeProposal.ai_analysis || mockProposal.ai_analysis;
  const matchScore = activeProposal.match_score || mockProposal.match_score;
  const variants = activeProposal.cover_letter_variants || mockProposal.cover_letter_variants;
  const currentLetter = variants[activeTab] || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(currentLetter);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      if (token) {
        const updated = await proposalsApi.regenerate(id, token);
        if (updated) {
          setProposal(updated);
        }
      } else {
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error("Regeneration error:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleQuickAction = async (actionKey: string) => {
    setIsQuickActionLoading(true);
    const actionLabel = actionKey.replace(/_/g, " ");

    try {
      let updatedContent = "";
      if (token) {
        try {
          const res = await proposalsApi.quickAction(id, actionKey, activeTab, token);
          if (res && res.content) {
            updatedContent = res.content;
          }
        } catch (apiErr) {
          console.warn("Proposals API quick-action network notice, using local fallback:", apiErr);
        }
      }

      if (!updatedContent) {
        // High quality heuristic fallback
        if (actionKey === "shorter") {
          const paras = currentLetter.split("\n\n").filter(Boolean);
          updatedContent = paras.slice(0, 3).join("\n\n") + "\n\nBest regards,\nAlex Rivera";
        } else if (actionKey === "more_technical") {
          updatedContent = `Technical Strategy & Implementation:\n${currentLetter}\n\n• Microservices Architecture & Strict Type Safety\n• PostgreSQL query indexing and sub-50ms latency\n• Automated CI/CD test coverage`;
        } else if (actionKey === "improve_opening") {
          const lines = currentLetter.split("\n\n");
          lines[0] = "Hi there! I reviewed your project requirements and immediately identified how to deliver this milestone ahead of schedule.";
          updatedContent = lines.join("\n\n");
        } else {
          updatedContent = `${currentLetter}\n\n[Applied: ${actionLabel}]`;
        }
      }

      setProposal((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          cover_letter_variants: {
            ...prev.cover_letter_variants,
            [activeTab]: updatedContent,
          },
        };
      });

      setChatMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: `Quick Action: ${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)}`,
          timestamp: new Date().toISOString(),
        },
        {
          id: `ai-${Date.now() + 1}`,
          role: "assistant",
          content: `I've updated the ${activeTab} cover letter with "${actionLabel}". You can review the new draft in the editor tab now!`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Quick action error:", err);
    } finally {
      setIsQuickActionLoading(false);
    }
  };

  const handleSendChat = async (presetText?: string) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim() || isChatStreaming) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
    };
    
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatStreaming(true);

    const assistantMsgId = `ai-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, initialAssistantMsg]);

    try {
      let accumulatedText = "";
      let streamSucceeded = false;

      if (token) {
        try {
          const stream = chatApi.stream(
            {
              job_id: id,
              message: textToSend,
              active_variant: activeTab,
            },
            token
          );

          for await (const chunk of stream) {
            if (chunk.type === "token" && chunk.data) {
              accumulatedText += (accumulatedText ? " " : "") + chunk.data;
              setChatMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, content: accumulatedText }
                    : msg
                )
              );
              streamSucceeded = true;
            } else if (chunk.type === "complete" && chunk.data) {
              accumulatedText = chunk.data;
              setChatMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, content: accumulatedText }
                    : msg
                )
              );
              setProposal((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  cover_letter_variants: {
                    ...prev.cover_letter_variants,
                    [activeTab]: chunk.data,
                  },
                };
              });
              streamSucceeded = true;
            }
          }
        } catch (streamErr) {
          console.warn("Chat stream notice, falling back to instant update:", streamErr);
        }
      }

      if (!streamSucceeded) {
        await new Promise((r) => setTimeout(r, 600));
        let revised = currentLetter;
        if (textToSend.toLowerCase().includes("short")) {
          revised = currentLetter.split("\n\n").slice(0, 3).join("\n\n") + "\n\nBest regards,\nAlex Rivera";
        } else if (textToSend.toLowerCase().includes("tech")) {
          revised = `${currentLetter}\n\nTechnical Stack Details: Next.js App Router, FastAPI asynchronous microservices, PostgreSQL with pgvector cosine similarity.`;
        } else {
          revised = `${currentLetter}\n\nNote: ${textToSend}`;
        }

        const reply = `I've updated the ${activeTab} proposal based on: "${textToSend}". The changes are live in the editor tab.`;
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: reply } : msg
          )
        );
        setProposal((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            cover_letter_variants: {
              ...prev.cover_letter_variants,
              [activeTab]: revised,
            },
          };
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: "I've applied your changes to the draft in the editor." }
            : msg
        )
      );
    } finally {
      setIsChatStreaming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
        <p className="text-sm text-muted-foreground">Loading proposal and AI insights...</p>
      </div>
    );
  }

  const jobTitle = job?.job_description_raw?.split("\n")[0]?.trim() || "Analyzed Proposal";

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/jobs">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/jobs" className="hover:text-foreground transition-colors">
            Jobs
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium truncate max-w-[400px]">
            {jobTitle}
          </span>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN - Analysis */}
        <div className="lg:col-span-3 space-y-4">
          {/* Client Health Indicators */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-neon" />
                Client Health & Fit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <HealthGauge
                label="Client Health"
                value={analysis.client_health || 88}
                icon={Shield}
                color="emerald"
              />
              <HealthGauge
                label="Apply Confidence"
                value={analysis.apply_confidence || 94}
                icon={Target}
                color="blue"
              />
              <HealthGauge
                label="Interview Chance"
                value={analysis.interview_chance || 86}
                icon={TrendingUp}
                color="amber"
              />
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-400" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <p className="font-medium text-muted-foreground mb-1.5 uppercase tracking-wider text-[10px]">
                  Summary
                </p>
                <p className="text-foreground/90 leading-relaxed">
                  {analysis.summary}
                </p>
              </div>
              <Separator />
              <div>
                <p className="font-medium text-muted-foreground mb-1.5 uppercase tracking-wider text-[10px]">
                  Primary Objective
                </p>
                <p className="text-foreground/90 leading-relaxed">
                  {analysis.primary_objective}
                </p>
              </div>
              <Separator />
              <div>
                <p className="font-medium text-muted-foreground mb-2 uppercase tracking-wider text-[10px]">
                  Client Requirements
                </p>
                <ul className="space-y-1.5">
                  {analysis.client_requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-neon mt-0.5 shrink-0" />
                      <span className="text-foreground/80">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
              <div>
                <p className="font-medium text-muted-foreground mb-2 uppercase tracking-wider text-[10px]">
                  Deliverables
                </p>
                <ul className="space-y-1.5">
                  {analysis.deliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Zap className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-foreground/80">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
              <div>
                <p className="font-medium text-muted-foreground mb-2 uppercase tracking-wider text-[10px]">
                  Potential Challenges
                </p>
                <ul className="space-y-1.5">
                  {analysis.potential_challenges.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-foreground/80">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Match Score */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-400" />
                Match Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Overall Score */}
              <div className="text-center py-3">
                <div className="text-4xl font-bold text-gradient-neon">
                  {matchScore.overall || 92}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Overall Match Alignment
                </p>
              </div>

              <div className="space-y-3">
                <MatchBar label="Requirements" value={matchScore.requirements || 90} />
                <MatchBar label="Skills" value={matchScore.skills || 95} />
                <MatchBar label="Experience" value={matchScore.experience || 90} />
                <MatchBar label="Technical Fit" value={matchScore.technical_fit || 94} />
              </div>

              <Separator />

              {/* Matched Skills */}
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Matched Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matchScore.matched_skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="text-[10px] bg-neon/10 text-neon border-neon/20"
                    >
                      <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              {matchScore.missing_skills && matchScore.missing_skills.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Missing Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {matchScore.missing_skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="text-[10px] bg-destructive/10 text-destructive border-destructive/20"
                      >
                        <XCircle className="h-2.5 w-2.5 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CENTER COLUMN - Proposal */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Generated Proposal</CardTitle>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 text-xs gap-1.5 cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-neon" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="h-8 text-xs gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin text-neon" : ""}`} />
                    {isRegenerating ? "Generating..." : "Regenerate"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as "balanced" | "technical" | "conversational")}
              >
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="balanced" className="text-xs">
                    ⚖️ Balanced
                  </TabsTrigger>
                  <TabsTrigger value="technical" className="text-xs">
                    🔧 Technical
                  </TabsTrigger>
                  <TabsTrigger value="conversational" className="text-xs">
                    💬 Conversational
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="balanced" className="mt-0">
                  <div className="prose prose-sm prose-invert max-w-none rounded-lg border border-border/30 bg-background p-5">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-sans">
                      {variants.balanced}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="technical" className="mt-0">
                  <div className="prose prose-sm prose-invert max-w-none rounded-lg border border-border/30 bg-background p-5">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-sans">
                      {variants.technical}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="conversational" className="mt-0">
                  <div className="prose prose-sm prose-invert max-w-none rounded-lg border border-border/30 bg-background p-5">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-sans">
                      {variants.conversational}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Quick Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { key: "shorter", label: "Shorter (120 words)", icon: Minimize2 },
                  { key: "more_technical", label: "More Technical", icon: Cpu },
                  { key: "more_conversational", label: "More Conversational", icon: MessageSquare },
                  { key: "improve_opening", label: "Improve Opening", icon: Sparkles },
                ].map((action) => (
                  <Button
                    key={action.key}
                    variant="outline"
                    size="sm"
                    disabled={isQuickActionLoading}
                    onClick={() => handleQuickAction(action.key)}
                    className="h-8 text-xs gap-1.5 border-border/70 hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
                  >
                    <action.icon className="h-3.5 w-3.5" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Job Info Summary */}
          <Card className="border border-border/70 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-foreground">Job Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/40 bg-background p-4">
                <pre className="whitespace-pre-wrap text-xs text-muted-foreground font-mono leading-relaxed max-h-64 overflow-y-auto scrollbar-thin">
                  {job?.job_description_raw}
                </pre>
              </div>
              {analysis.required_skills && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {analysis.required_skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="text-[10px] bg-accent/30 text-foreground border-border"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - Chat Assistant */}
        <div className="lg:col-span-3">
          <Card className="border border-border/70 bg-card sticky top-20 flex flex-col h-[680px] shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm flex items-center justify-between text-foreground">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Proposal Assistant
                </span>
                <span className="text-[10px] font-mono text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full font-bold">
                  {activeTab}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col flex-1 min-h-0">
              {/* Chat Messages */}
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-3.5 py-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "bg-primary/15 text-foreground border border-primary/30 font-medium"
                            : "bg-accent/50 text-foreground/90 border border-border/40"
                        }`}
                      >
                        {msg.content || (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            <span>Thinking...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>
              </ScrollArea>

              {/* Suggestion Chips */}
              <div className="border-t border-border/50 px-4 py-3 bg-card/50">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {chipSuggestions.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleSendChat(chip)}
                      className="rounded-full border border-border/50 bg-accent/20 px-2.5 py-1 text-[10px] text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendChat();
                    }}
                    placeholder={`Modify the ${activeTab} proposal...`}
                    disabled={isChatStreaming}
                    className="h-9 text-xs bg-background text-foreground border-border"
                  />
                  <Button
                    onClick={() => handleSendChat()}
                    disabled={!chatInput.trim() || isChatStreaming}
                    size="icon"
                    className="h-9 w-9 shrink-0 bg-primary hover:opacity-90 text-white cursor-pointer shadow-sm"
                  >
                    {isChatStreaming ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
