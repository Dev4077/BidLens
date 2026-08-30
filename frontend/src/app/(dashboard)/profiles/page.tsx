"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Star,
  Edit2,
  Trash2,
  CheckCircle2,
  Briefcase,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { profilesApi } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { ConfirmationModal } from "@/components/confirmation-modal";
import type { Profile } from "@/lib/types";

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { token } = useAuth();

  const loadProfiles = async () => {
    if (!token) return;
    try {
      const data = await profilesApi.list(token).catch(() => []);
      setProfiles(data || []);
    } catch (error) {
      console.error("Failed to load profiles:", error);
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [token]);

  const confirmDeleteProfile = async () => {
    if (!profileToDelete) return;
    setIsDeleting(true);
    try {
      if (token) {
        await profilesApi.delete(profileToDelete.id, token).catch(() => null);
      }
      setProfiles((prev) => prev.filter((p) => p.id !== profileToDelete.id));
      setProfileToDelete(null);
    } catch (error) {
      console.error("Failed to delete profile:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      if (token) {
        await profilesApi.setDefault(id, token).catch(() => null);
      }
      setProfiles((prev) =>
        prev.map((p) => ({
          ...p,
          is_default: p.id === id,
        }))
      );
    } catch (error) {
      console.error("Failed to set default profile:", error);
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Profiles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create specialized profiles for different types of freelance work.
            Each profile tailors AI-generated proposals to match specific roles.
          </p>
        </div>
        <Link href="/profiles/new">
          <Button className="bg-primary hover:opacity-90 text-white font-semibold gap-2 shadow-lg shadow-primary/25 cursor-pointer">
            <Plus className="h-4 w-4" />
            Create Profile
          </Button>
        </Link>
      </div>

      {/* Profile Cards Grid */}
      {profiles.length === 0 ? (
        <Card className="border border-border/70 bg-card p-12 text-center shadow-lg">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary mb-3">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Freelance Profiles Created Yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-5">
            Create a specialized profile so our AI agent can tailor cover letters to your real skills, tone, and experience.
          </p>
          <Link href="/profiles/new">
            <Button className="bg-primary hover:opacity-90 text-white font-semibold gap-2 h-10 px-5 shadow-md shadow-primary/30 cursor-pointer">
              <Plus className="h-4 w-4" />
              Create Your First Profile
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className={`group relative border-border/70 hover:border-border transition-all duration-300 hover:shadow-lg flex flex-col justify-between ${
                profile.is_default ? "border-primary/40 bg-primary/[0.02]" : ""
              }`}
            >
              <CardContent className="p-5">
                {/* Profile Header */}
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold group-hover:text-primary transition-colors truncate text-foreground">
                        {profile.profile_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {profile.years_experience} years exp.
                      </p>
                    </div>
                  </div>

                  {profile.is_default && (
                    <Badge className="bg-primary/15 text-primary border border-primary/30 text-[10px] font-semibold gap-1 px-2 py-0.5 shadow-sm shrink-0">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      DEFAULT
                    </Badge>
                  )}
                </div>

                {/* Headline */}
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                  {profile.headline}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {profile.skills.slice(0, 6).map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="text-[10px] bg-secondary text-secondary-foreground border-border"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {profile.skills.length > 6 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-secondary text-secondary-foreground border-border"
                    >
                      +{profile.skills.length - 6} more
                    </Badge>
                  )}
                </div>

                {/* Tone & Length */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span className="capitalize">
                    🎤 {profile.tone_preference}
                  </span>
                  <span>📝 {profile.preferred_length} words</span>
                </div>
              </CardContent>

              {/* Actions Footer */}
              <div className="px-5 pb-4 pt-3 border-t border-border/50 flex items-center justify-between">
                {profile.is_default ? (
                  <span className="text-xs font-medium text-primary flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Active Default
                  </span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1 text-muted-foreground hover:text-primary cursor-pointer p-0"
                    onClick={() => handleSetDefault(profile.id)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Set Default
                  </Button>
                )}
                <div className="flex gap-1">
                  <Link href={`/profiles/${profile.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                    onClick={() => setProfileToDelete(profile)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modern Custom Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!profileToDelete}
        onClose={() => setProfileToDelete(null)}
        onConfirm={confirmDeleteProfile}
        isLoading={isDeleting}
        title="Delete Freelance Profile"
        description={`Are you sure you want to permanently delete "${profileToDelete?.profile_name}"? This action cannot be undone.`}
        confirmText="Delete Profile"
        variant="danger"
      />
    </div>
  );
}
