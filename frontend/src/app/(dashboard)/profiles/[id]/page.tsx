"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { profilesApi } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { mockProfiles, popularSkills } from "@/lib/mock-data";
import type { ProfileFormData, TonePreference } from "@/lib/types";

export default function EditProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { token } = useAuth();
  const isNew = id === "new";

  const [formData, setFormData] = useState<ProfileFormData>({
    profile_name: "",
    headline: "",
    years_experience: 5,
    summary: "",
    skills: ["TypeScript", "React", "Next.js", "Python", "Node.js"],
    industries: ["SaaS", "Fintech", "AI"],
    specialties: "",
    portfolio_url: "",
    github_url: "",
    website_url: "",
    upwork_url: "",
    ai_instructions: "",
    tone_preference: "balanced",
    preferred_length: 450,
    is_default: false,
  });

  const [skillInput, setSkillInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing profile if editing
  useEffect(() => {
    async function loadProfile() {
      if (isNew) return;
      setIsLoading(true);
      try {
        if (token) {
          const profile = await profilesApi.get(id, token);
          if (profile) {
            setFormData({
              profile_name: profile.profile_name || "",
              headline: profile.headline || "",
              years_experience: profile.years_experience || 0,
              summary: profile.summary || "",
              skills: profile.skills || [],
              industries: profile.industries || [],
              specialties: profile.specialties || "",
              portfolio_url: profile.portfolio_url || "",
              github_url: profile.github_url || "",
              website_url: profile.website_url || "",
              upwork_url: profile.upwork_url || "",
              ai_instructions: profile.ai_instructions || "",
              tone_preference: profile.tone_preference || "balanced",
              preferred_length: profile.preferred_length || 500,
              is_default: profile.is_default || false,
            });
          }
        } else {
          const fallback = mockProfiles.find((p) => p.id === id);
          if (fallback) {
            setFormData({
              profile_name: fallback.profile_name,
              headline: fallback.headline,
              years_experience: fallback.years_experience,
              summary: fallback.summary,
              skills: fallback.skills,
              industries: fallback.industries,
              specialties: fallback.specialties || "",
              portfolio_url: fallback.portfolio_url || "",
              github_url: fallback.github_url || "",
              website_url: fallback.website_url || "",
              upwork_url: fallback.upwork_url || "",
              ai_instructions: fallback.ai_instructions || "",
              tone_preference: fallback.tone_preference,
              preferred_length: fallback.preferred_length,
              is_default: fallback.is_default,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [id, isNew, token]);

  const addSkill = useCallback(
    (skill: string) => {
      const trimmed = skill.trim();
      if (trimmed && !formData.skills.includes(trimmed) && formData.skills.length < 20) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, trimmed],
        }));
      }
      setSkillInput("");
      setShowSuggestions(false);
    },
    [formData.skills]
  );

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const filteredSuggestions = popularSkills.filter(
    (s) =>
      s.toLowerCase().includes(skillInput.toLowerCase()) &&
      !formData.skills.includes(s)
  );

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      if (token) {
        if (isNew) {
          await profilesApi.create(formData, token);
        } else {
          await profilesApi.update(id, formData, token);
        }
      }
      router.push("/profiles");
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setSaveError(err.message || "Failed to save profile. Please check the inputs and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/profiles")}
          className="h-9 w-9 cursor-pointer text-foreground hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isNew ? "Create Profile" : "Edit Profile"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isNew
              ? "Set up a new freelancer profile for AI proposal generation."
              : "Update your profile details and AI preferences."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {saveError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
            <span>{saveError}</span>
          </div>
        )}
        {/* Basic Info */}
        <Card className="border border-border/70 bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-foreground">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile_name" className="text-xs font-medium text-foreground">
                Profile Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="profile_name"
                value={formData.profile_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    profile_name: e.target.value,
                  }))
                }
                placeholder="e.g., AI Full-Stack Specialist"
                className="bg-background text-foreground border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline" className="text-xs font-medium text-foreground">
                Headline / Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="headline"
                value={formData.headline}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, headline: e.target.value }))
                }
                placeholder="e.g., Senior Full-Stack Developer | React, Node.js, Python, AWS & AI"
                className="bg-background text-foreground border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years_experience" className="text-xs font-medium text-foreground">
                Years of Experience <span className="text-destructive">*</span>
              </Label>
              <Input
                id="years_experience"
                type="number"
                min={0}
                max={50}
                value={formData.years_experience}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    years_experience: parseInt(e.target.value) || 0,
                  }))
                }
                className="bg-background text-foreground border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary" className="text-xs font-medium text-foreground">
                Summary <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, summary: e.target.value }))
                }
                placeholder="Describe your experience, specializations, and what makes you stand out..."
                className="bg-background text-foreground border-border"
                rows={5}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="border border-border/70 bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-foreground flex items-center justify-between">
              <span>
                Skills <span className="text-destructive">*</span>
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {formData.skills.length}/20
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected Skills */}
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="bg-primary/10 border-primary/30 text-primary gap-1 pr-1 h-7"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {/* Skill Input */}
            <div className="relative">
              <Input
                value={skillInput}
                onChange={(e) => {
                  setSkillInput(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
                onFocus={() => setShowSuggestions(skillInput.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Type a skill and press Enter..."
                className="bg-background text-foreground border-border"
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-popover p-2 shadow-xl scrollbar-thin">
                  {filteredSuggestions.slice(0, 10).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => addSkill(suggestion)}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm text-popover-foreground hover:bg-accent transition-colors cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Skills */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Popular skills — click to add
              </p>
              <div className="flex flex-wrap gap-1.5">
                {popularSkills
                  .filter((s) => !formData.skills.includes(s))
                  .slice(0, 18)
                  .map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
                    >
                      {skill}
                    </button>
                  ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Maximum 20 skills. Click a tag to remove it.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Links & Info */}
        <Card className="border border-border/70 bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-foreground">Links & Portfolio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="portfolio_url" className="text-xs font-medium text-foreground">Portfolio URL</Label>
                <Input
                  id="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      portfolio_url: e.target.value,
                    }))
                  }
                  placeholder="https://yourportfolio.com"
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github_url" className="text-xs font-medium text-foreground">GitHub URL</Label>
                <Input
                  id="github_url"
                  value={formData.github_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      github_url: e.target.value,
                    }))
                  }
                  placeholder="https://github.com/username"
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website_url" className="text-xs font-medium text-foreground">Website URL</Label>
                <Input
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      website_url: e.target.value,
                    }))
                  }
                  placeholder="https://yoursite.com"
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upwork_url" className="text-xs font-medium text-foreground">Upwork Profile URL</Label>
                <Input
                  id="upwork_url"
                  value={formData.upwork_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      upwork_url: e.target.value,
                    }))
                  }
                  placeholder="https://upwork.com/freelancers/..."
                  className="bg-background text-foreground border-border"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Preferences */}
        <Card className="border border-border/70 bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-foreground">AI Proposal Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="ai_instructions" className="text-xs font-medium text-foreground">Custom AI Instructions</Label>
              <Textarea
                id="ai_instructions"
                value={formData.ai_instructions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ai_instructions: e.target.value,
                  }))
                }
                placeholder="Specific guidance for AI (e.g., 'Always highlight my AWS certified solutions architect badge')..."
                className="bg-background text-foreground border-border"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground">Default Tone</Label>
              <Select
                value={formData.tone_preference}
                onValueChange={(v) => {
                  if (v) setFormData((prev) => ({ ...prev, tone_preference: v as TonePreference }));
                }}
              >
                <SelectTrigger className="bg-background text-foreground border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced (Professional & Engaging)</SelectItem>
                  <SelectItem value="technical">Technical (Architecture & Engineering)</SelectItem>
                  <SelectItem value="conversational">Conversational (Warm & Direct)</SelectItem>
                  <SelectItem value="concise">Concise (Under 150 words)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-foreground">Target Word Count</Label>
                <span className="text-sm font-mono text-primary font-bold tabular-nums">
                  {formData.preferred_length} words
                </span>
              </div>
              <Slider
                value={[formData.preferred_length]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setFormData((prev) => ({ ...prev, preferred_length: val }));
                }}
                min={100}
                max={1000}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>100 (Brief)</span>
                <span>450 (Standard)</span>
                <span>1000 (Detailed)</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-background/50">
              <div>
                <p className="text-sm font-medium text-foreground">Set as Default Profile</p>
                <p className="text-xs text-muted-foreground">
                  This profile will be automatically pre-selected when creating new proposals
                </p>
              </div>
              <Switch
                checked={formData.is_default}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_default: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSaving}
          className="w-full bg-primary hover:opacity-90 text-white font-semibold h-11 text-sm gap-2 shadow-lg shadow-primary/25 cursor-pointer"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Saving..." : isNew ? "Create Profile" : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
