"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  User,
  Briefcase,
  Layers,
  Wand2,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/auth-provider";
import { profilesApi } from "@/lib/api";

const SUGGESTED_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "FastAPI",
  "LangChain",
  "Supabase",
  "Tailwind CSS",
  "UI/UX Design",
  "PostgreSQL",
  "Docker",
  "AWS",
  "GraphQL",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [step, setStep] = useState(1);
  const [profileName, setProfileName] = useState("Primary Freelance Profile");
  const [headline, setHeadline] = useState("Full-Stack Engineer & AI Systems Developer");
  const [yearsExp, setYearsExp] = useState(5);
  const [summary, setSummary] = useState(
    "Experienced software engineer delivering high-performance SaaS applications, custom integrations, and AI agent architectures."
  );
  const [skills, setSkills] = useState<string[]>(["React", "Next.js", "TypeScript", "Python", "FastAPI"]);
  const [skillInput, setSkillInput] = useState("");
  const [tone, setTone] = useState<"balanced" | "concise" | "technical" | "conversational">("balanced");
  const [preferredLength, setPreferredLength] = useState(400);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills((prev) => [...prev, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        profile_name: profileName,
        headline,
        years_experience: Number(yearsExp),
        summary,
        skills,
        tone_preference: tone,
        preferred_length: Number(preferredLength),
        is_default: true,
      };

      if (token) {
        await profilesApi.create(payload, token).catch(() => null);
      }

      router.push("/jobs/new");
    } catch (err) {
      console.error("Onboarding failed:", err);
      router.push("/jobs/new");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Soft Glows (Midnight Blue & Pale Cyan) */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#1D3557] blur-[140px] opacity-40" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#457B9D] blur-[150px] opacity-25" />

      <div className="relative w-full max-w-2xl animate-fade-in z-10">
        <Card className="border border-border/70 bg-card shadow-2xl">
          <CardHeader className="text-center pb-4 border-b border-border/50">
            <div className="mx-auto mb-2 flex justify-center">
              <BrandLogo size="lg" showText={false} />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Welcome to BidLens
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground max-w-md mx-auto">
              Set up your primary profile so our AI agent can craft tailored, high-converting proposals matching your real experience.
            </CardDescription>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-3 pt-3">
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 1 ? "text-primary font-bold" : "text-muted-foreground"}`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step >= 1 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  1
                </span>
                Role & Bio
              </div>
              <div className="h-0.5 w-8 bg-border/60" />
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 2 ? "text-primary font-bold" : "text-muted-foreground"}`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step >= 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  2
                </span>
                Skills & Tone
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {step === 1 ? (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground">Profile Name</Label>
                  <Input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g. Full-Stack AI Engineer"
                    className="h-10 bg-background text-foreground border-border text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground">Professional Headline</Label>
                  <Input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Developer | React, Node.js, Python & AI"
                    className="h-10 bg-background text-foreground border-border text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground">Years of Experience</Label>
                  <Input
                    type="number"
                    value={yearsExp}
                    onChange={(e) => setYearsExp(Number(e.target.value))}
                    min={1}
                    max={40}
                    className="h-10 bg-background text-foreground border-border text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground">Bio Summary</Label>
                  <Textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={3}
                    placeholder="Briefly describe your specialization, key strengths, and track record..."
                    className="bg-background text-foreground border-border text-sm resize-none"
                  />
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!profileName.trim() || !headline.trim()}
                  className="w-full h-11 bg-primary text-white font-semibold gap-2 shadow-lg shadow-primary/25 cursor-pointer mt-4 hover:opacity-90"
                >
                  Continue to Skills & Tone
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in">
                {/* Skills */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground">Select Core Skills</Label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                    {SUGGESTED_SKILLS.map((skill) => {
                      const isSelected = skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary text-white shadow-sm shadow-primary/30"
                              : "bg-secondary text-secondary-foreground hover:bg-accent/80 hover:text-foreground"
                          }`}
                        >
                          {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomSkill();
                        }
                      }}
                      placeholder="Add another skill (press Enter)..."
                      className="h-8 bg-background text-foreground text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCustomSkill}
                      className="h-8 text-xs cursor-pointer text-foreground"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Tone Preference */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-foreground">Proposal Tone</Label>
                    <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                      <SelectTrigger className="h-10 bg-background text-foreground text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                        <SelectItem value="technical">Highly Technical</SelectItem>
                        <SelectItem value="conversational">Friendly & Warm</SelectItem>
                        <SelectItem value="concise">Direct & Concise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-foreground">Target Word Count</Label>
                    <Input
                      type="number"
                      value={preferredLength}
                      onChange={(e) => setPreferredLength(Number(e.target.value))}
                      step={50}
                      min={150}
                      max={800}
                      className="h-10 bg-background text-foreground text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-11 px-5 cursor-pointer text-xs text-foreground"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={isSubmitting || skills.length === 0}
                    className="flex-1 h-11 bg-primary text-white font-semibold gap-2 shadow-lg shadow-primary/30 cursor-pointer hover:opacity-90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Complete Setup & Launch Studio
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
