"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  FileText,
  Check,
  Loader2,
  Brain,
  Search,
  Target,
  PenTool,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { profilesApi, knowledgeApi, jobsApi } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { mockProfiles, mockDocuments } from "@/lib/mock-data";
import type { Profile, KnowledgeDocument } from "@/lib/types";

const generationPhases = [
  { key: "parsing", label: "Parsing job description & requirements", icon: Brain },
  { key: "matching", label: "Matching with profile & evaluating fit", icon: Target },
  { key: "retrieving", label: "Retrieving relevant knowledge base context", icon: Search },
  { key: "generating", label: "Generating tailored cover letter variants", icon: PenTool },
];

export default function NewJobPage() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [profiles, setProfiles] = useState<Profile[]>(mockProfiles);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(mockDocuments);
  const [jobDescription, setJobDescription] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  // Load profiles and documents from backend
  useEffect(() => {
    async function loadData() {
      if (!token) return;
      try {
        const [profData, docData] = await Promise.all([
          profilesApi.list(token).catch(() => mockProfiles),
          knowledgeApi.list(token).catch(() => mockDocuments),
        ]);
        
        if (profData && profData.length > 0) {
          setProfiles(profData);
          const defaultProf = profData.find((p) => p.is_default) || profData[0];
          setSelectedProfile(defaultProf.id);
        }
        if (docData && docData.length > 0) {
          setDocuments(docData);
        }
      } catch (err) {
        console.error("Error loading profile/doc data:", err);
      }
    }
    loadData();
  }, [token]);

  const indexedDocs = documents.filter((d) => d.status === "indexed" || !d.status);

  const toggleDoc = (docId: string) => {
    setSelectedDocs((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim() || !selectedProfile) return;

    setIsGenerating(true);
    setCurrentPhase(0);
    setErrorMsg("");

    // Start interval to step through visual phases while backend processes
    const phaseTimer = setInterval(() => {
      setCurrentPhase((prev) => {
        if (prev < generationPhases.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500);

    try {
      let createdJobId = "j1";

      if (token) {
        const job = await jobsApi.create(
          {
            job_description_raw: jobDescription,
            profile_id: selectedProfile,
            document_ids: selectedDocs,
          },
          token
        );
        if (job && job.id) {
          createdJobId = job.id;
        }
      } else {
        // Dev / fallback simulate delay
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }

      clearInterval(phaseTimer);
      setCurrentPhase(generationPhases.length - 1);
      
      // Short delay to show final checkmark
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsGenerating(false);
      router.push(`/jobs/${createdJobId}`);
    } catch (err: any) {
      clearInterval(phaseTimer);
      setIsGenerating(false);
      setErrorMsg(err.message || "Failed to generate proposal. Please try again.");
      console.error("Proposal generation failed:", err);
    }
  };

  const selectedProfileData = profiles.find((p) => p.id === selectedProfile) || profiles[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Proposal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter a job description, select your profile and attached documents, and generate a tailored proposal.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Job Description */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-neon" />
            Job Details / Job Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder={`Paste the full job description here...\n\nExample:\nSenior Full-Stack Developer React, Node.js, TypeScript, AWS & AI\n\nPosted 20 minutes ago\nWorldwide\n\nSummary:\nWe are looking for an experienced Senior Full-Stack Developer to build our next-generation AI SaaS application...`}
            rows={11}
            className="resize-y font-mono text-sm bg-background"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {jobDescription.length > 0
              ? `${jobDescription.split(/\s+/).filter(Boolean).length} words entered`
              : "Paste the complete job listing for the most accurate match and proposal"}
          </p>
        </CardContent>
      </Card>

      {/* Profile Selection */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Target Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Select
            value={selectedProfile || (profiles[0]?.id ?? "")}
            onValueChange={(v) => {
              if (v) setSelectedProfile(v);
            }}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select a profile" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  <span className="flex items-center gap-2">
                    {profile.profile_name} — {profile.headline}
                    {profile.is_default && (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-neon/10 text-neon border-neon/30 ml-2"
                      >
                        default
                      </Badge>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            The AI uses the selected profile's skills, tone, and experience to personalize the proposal.
          </p>
          {selectedProfileData && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {selectedProfileData.skills.slice(0, 8).map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="text-[10px] bg-accent/50 text-muted-foreground"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Attachment */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Attach Knowledge Base Documents{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {indexedDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No indexed documents available.{" "}
              <a href="/knowledge-base" className="text-neon hover:underline">
                Upload case studies or portfolio
              </a>{" "}
              to your knowledge base first.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {indexedDocs.map((doc) => {
                const isSelected = selectedDocs.includes(doc.id);
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => toggleDoc(doc.id)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${
                      isSelected
                        ? "border-neon/50 bg-neon/10 text-neon"
                        : "border-border bg-accent/30 text-muted-foreground hover:border-border hover:bg-accent/50"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                    <FileText className="h-3.5 w-3.5" />
                    {doc.filename}
                  </button>
                );
              })}
            </div>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Selected documents supply grounded RAG context for past case studies and references.
          </p>
        </CardContent>
      </Card>

      {/* Generate Button / Progress Card */}
      {isGenerating ? (
        <Card className="border-neon/30 glow-neon overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon/20 animate-pulse">
                <Sparkles className="h-5 w-5 text-neon" />
              </div>
              <div>
                <p className="text-sm font-semibold">LangGraph AI Pipeline Active</p>
                <p className="text-xs text-muted-foreground">
                  Running multi-step agentic analysis and generation...
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {generationPhases.map((phase, index) => {
                const PhaseIcon = phase.icon;
                const isActive = index === currentPhase;
                const isDone = index < currentPhase;

                return (
                  <div
                    key={phase.key}
                    className={`flex items-center gap-3 transition-opacity duration-300 ${
                      index > currentPhase ? "opacity-30" : "opacity-100"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
                        isDone
                          ? "bg-neon/20"
                          : isActive
                          ? "bg-neon/10 animate-pulse"
                          : "bg-accent/30"
                      }`}
                    >
                      {isDone ? (
                        <Check className="h-4 w-4 text-neon" />
                      ) : isActive ? (
                        <Loader2 className="h-4 w-4 text-neon animate-spin" />
                      ) : (
                        <PhaseIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        isDone
                          ? "text-neon font-medium"
                          : isActive
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {phase.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Skeleton preview */}
            <div className="mt-6 space-y-3 rounded-lg border border-border/30 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={handleGenerate}
          disabled={!jobDescription.trim() || !selectedProfile}
          className="w-full h-12 text-base font-medium bg-gradient-neon hover:opacity-90 text-white gap-2 shadow-lg shadow-neon/25 disabled:opacity-40 disabled:shadow-none transition-all cursor-pointer"
        >
          <Sparkles className="h-5 w-5" />
          Generate Tailored Proposal
        </Button>
      )}
    </div>
  );
}
