"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import {
  User,
  Moon,
  Sun,
  Monitor,
  Shield,
  Bell,
  Webhook,
  Key,
  LogOut,
  Check,
  Palette,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";
import { useAccentTheme, ACCENT_OPTIONS, type AccentColor } from "@/components/accent-theme-provider";

import { ConfirmationModal } from "@/components/confirmation-modal";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { accent, setAccent } = useAccentTheme();
  const { user, signOut, isAdmin } = useAuth();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || (isAdmin ? "Sakarsa Super Admin" : "Freelancer")
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile, single-color theme appearance, and notification preferences.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
          className="gap-1.5 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>

      {/* Account Details */}
      <Card className="border border-border/70 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <User className="h-4 w-4 text-primary" />
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-foreground">Email Address</Label>
              <Input
                id="email"
                value={user?.email || (isAdmin ? "dev@sakarsa.com" : "demo@bidlens.ai")}
                disabled
                className="bg-background text-muted-foreground font-mono text-xs border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground">Active Subscription Plan</Label>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-primary/15 text-primary border-primary/30 uppercase tracking-wider text-[10px] font-bold"
                >
                  {isAdmin ? "Super Admin (Unlimited)" : "Free Account"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {isAdmin ? "Full Root Access" : "3 proposals/week · 1 profile"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-xs font-medium text-foreground">Display Name</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-background text-foreground border-border text-sm"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="bg-primary text-white hover:opacity-90 cursor-pointer gap-1.5 font-semibold shadow-md"
            >
              {isSaved ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" />
                  Saved
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Appearance & Single Accent Color */}
      <Card className="border border-border/70 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <Palette className="h-4 w-4 text-primary" />
            Appearance & Brand Color
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Customize your interface mode and primary accent color.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode (Dark / Light / System) */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">Interface Mode</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark (Noir)", icon: Moon },
                { value: "system", label: "System", icon: Monitor },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all cursor-pointer ${
                    theme === option.value
                      ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
                      : "border-border hover:border-border hover:bg-accent/40 text-muted-foreground"
                  }`}
                >
                  <option.icon className="h-5 w-5" />
                  <span className="text-xs">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator className="border-border/50" />

          {/* Accent Color Palette Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-foreground">Single Accent Color (Default: Electric Blue)</Label>
              <span className="text-xs font-mono text-primary font-semibold capitalize">
                {accent} active
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ACCENT_OPTIONS.map((opt) => {
                const isSelected = accent === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAccent(opt.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:border-border hover:bg-accent/40"
                    }`}
                  >
                    <div
                      className="h-5 w-5 rounded-full shrink-0 flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: opt.hex }}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs truncate ${isSelected ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                        {opt.name.split(" ")[0]}
                      </p>
                      {opt.id === "blue" && (
                        <span className="text-[9px] text-primary font-bold uppercase block">
                          Default
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border border-border/70 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <Bell className="h-4 w-4 text-primary" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Email Notifications</p>
              <p className="text-xs text-muted-foreground">
                Receive email alerts on successful proposal generation and weekly digests
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <Separator className="border-border/50" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Push Notifications</p>
              <p className="text-xs text-muted-foreground">
                In-browser real-time toast alerts during generation phases
              </p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* API & Webhooks */}
      <Card className="border border-border/70 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <Webhook className="h-4 w-4 text-primary" />
            API & Webhooks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">Personal API Key</Label>
            <div className="flex gap-2">
              <Input
                value="bl_live_948f98a213e84e7bb12"
                disabled
                className="bg-background text-muted-foreground font-mono text-xs border-border"
              />
              <Button variant="outline" size="sm" className="shrink-0 gap-1 cursor-pointer border-border text-foreground">
                <Key className="h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border border-destructive/30 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <Shield className="h-4 w-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your user account, stored proposals, and vector documents.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="cursor-pointer"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modern Custom Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={signOut}
        title="Delete BidLens Account"
        description="Are you sure you want to permanently delete your account, stored profiles, and AI generation history? This action cannot be reversed."
        confirmText="Delete Account"
        variant="danger"
      />
    </div>
  );
}
