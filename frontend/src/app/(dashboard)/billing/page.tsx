"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  Zap,
  Crown,
  Cpu,
  Sparkles,
  AlertCircle,
  Shield,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { billingPlans } from "@/lib/mock-data";
import { useAuth } from "@/components/auth-provider";
import { billingApi } from "@/lib/api";

export default function BillingPage() {
  const { token, user } = useAuth();

  const [usage, setUsage] = useState({
    tier: "free",
    tier_name: "Free",
    price_monthly: 0,
    proposals_used: 0,
    proposals_limit: 3,
    tokens_used: 0,
    token_limit: 50000,
    prompt_tokens: 0,
    completion_tokens: 0,
    assigned_model: "gpt-4o",
    status: "active",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);

  const fetchUsageData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await billingApi.getUsage(token);
      if (data) {
        setUsage(data);
      }
    } catch (err) {
      console.warn("Failed to fetch billing usage:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, [token]);

  const handleUpgrade = async (tierId: string) => {
    if (!token) return;
    setUpgradingTier(tierId);
    try {
      const updated = await billingApi.upgrade(tierId, token);
      if (updated) {
        setUsage(updated);
      }
    } catch (err) {
      console.error("Upgrade error:", err);
    } finally {
      setUpgradingTier(null);
    }
  };

  const currentPlan = usage.tier;
  const usedProposals = usage.proposals_used;
  const totalProposals = usage.proposals_limit;
  const tokensUsed = usage.tokens_used;
  const tokenLimit = usage.token_limit;
  const promptTokens = usage.prompt_tokens;
  const completionTokens = usage.completion_tokens;

  const currentPlanObj = billingPlans.find((p) => p.id === currentPlan) || billingPlans[0];
  const currentPlanPrice = currentPlanObj.price;

  const tokenPercent = Math.min(100, Math.round((tokensUsed / Math.max(1, tokenLimit)) * 100));
  const proposalPercent =
    totalProposals > 0
      ? Math.min(100, Math.round((usedProposals / totalProposals) * 100))
      : 15;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing & Usage Meters</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Live telemetry of your weekly proposal allowance, token consumption, and active subscription plan.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsageData}
          disabled={isLoading}
          className="h-9 gap-1.5 text-xs self-start border-border text-foreground hover:bg-accent cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Metrics
        </Button>
      </div>

      {/* Free Account Limitations Notice if Free */}
      {currentPlan === "free" && (
        <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs text-foreground">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-primary">Free Account Active:</span>
            <p className="mt-0.5 text-muted-foreground">
              Your account includes <strong>3 proposals/week</strong>, <strong>1 freelance profile</strong>, and <strong>5 chat revisions per job</strong>. Upgrade anytime for higher volume or contact the Super Admin for bonus credits.
            </p>
          </div>
        </div>
      )}

      {/* Usage Analytics Grid (Live Dynamic Values) */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Proposal Allowance */}
        <Card className="border border-border/70 bg-card overflow-hidden shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Weekly Proposal Allowance</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Resets every Monday at 00:00 UTC
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-primary/15 text-primary border-primary/30 font-semibold uppercase tracking-wider text-[10px]"
              >
                {usage.tier_name || currentPlanObj.name}
              </Badge>
            </div>
            <div className="flex items-end gap-3 mb-3">
              <span className="text-4xl font-bold tabular-nums text-foreground">
                {usedProposals}
              </span>
              <span className="text-base text-muted-foreground mb-1">
                / {totalProposals === -1 ? "Unlimited" : `${totalProposals} proposals used`}
              </span>
            </div>
            <Progress value={proposalPercent} className="h-2.5" />
            <p className="mt-2 text-xs text-muted-foreground">
              {totalProposals === -1
                ? "Unlimited proposals available"
                : `${Math.max(0, totalProposals - usedProposals)} proposals remaining this week`}
            </p>
          </CardContent>
        </Card>

        {/* AI Tokens Used Meter */}
        <Card className="border border-border/70 bg-card overflow-hidden shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-primary" />
                  Monthly LLM Tokens Used
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {usage.assigned_model.toUpperCase()} Input & Output token metrics
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30 text-[10px] font-semibold">
                {tokenPercent}% Quota
              </Badge>
            </div>
            <div className="flex items-end gap-3 mb-3">
              <span className="text-4xl font-bold tabular-nums text-primary">
                {tokensUsed.toLocaleString()}
              </span>
              <span className="text-base text-muted-foreground mb-1">
                / {tokenLimit.toLocaleString()} tokens
              </span>
            </div>
            <Progress value={tokenPercent} className="h-2.5" />
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Prompt: <strong className="text-foreground">{promptTokens.toLocaleString()}</strong> tokens</span>
              <span>Completion: <strong className="text-foreground">{completionTokens.toLocaleString()}</strong> tokens</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Grid */}
      <div className="pt-2">
        <h2 className="text-lg font-semibold text-foreground mb-6">Subscription Tiers</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 pt-3">
          {billingPlans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const isHighlighted = plan.highlighted;
            const isDowngrade = plan.price < currentPlanPrice;
            const isThisUpgrading = upgradingTier === plan.id;

            return (
              <Card
                key={plan.id}
                className={`overflow-visible relative border bg-card transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${
                  isHighlighted
                    ? "border-primary border-2 shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                    : isCurrentPlan
                    ? "border-primary/50 bg-primary/[0.03]"
                    : "border-border/70 hover:border-border"
                }`}
              >
                {/* Fixed & High-Contrast MOST POPULAR Badge */}
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
                    <Badge className="bg-primary hover:bg-primary text-white border border-white/20 text-[10px] font-extrabold tracking-wider gap-1.5 px-3 py-1 shadow-lg shadow-primary/40 uppercase">
                      <Crown className="h-3.5 w-3.5 text-amber-300" />
                      MOST POPULAR
                    </Badge>
                  </div>
                )}

                <div>
                  <CardHeader className={`pb-3 ${isHighlighted ? "pt-6" : "pt-5"}`}>
                    <CardTitle className="text-center">
                      <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                      <div className="mt-3">
                        <span className="text-3xl font-bold text-foreground">
                          ${plan.price}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-xs text-muted-foreground">
                            /{plan.period}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground font-medium">
                        {plan.proposals_limit === -1
                          ? "Unlimited proposals"
                          : `${plan.proposals_limit} proposals/week`}
                      </p>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-6 pt-2">
                    <div className="space-y-2 text-xs">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2 text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="text-foreground/90">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-0">
                  {isCurrentPlan ? (
                    <Button
                      variant="outline"
                      className="w-full text-xs font-semibold h-10 border-primary/40 text-primary bg-primary/5 cursor-default"
                      disabled
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-primary" />
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isThisUpgrading}
                      className={`w-full text-xs font-semibold h-10 gap-1.5 cursor-pointer shadow-sm ${
                        isHighlighted
                          ? "bg-primary hover:opacity-90 text-white shadow-primary/30"
                          : "bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                      }`}
                    >
                      {isThisUpgrading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : isDowngrade ? (
                        "Downgrade"
                      ) : (
                        <>
                          <Zap className="h-3.5 w-3.5 text-amber-300" />
                          Upgrade
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
