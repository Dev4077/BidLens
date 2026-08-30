"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { signInAsAdmin } = useAuth();

  const [email, setEmail] = useState("dev@sakarsa.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const success = signInAsAdmin(email, password);
      if (!success) {
        setErrorMsg("Invalid super admin credentials. Please verify your email and password.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Admin authorization failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#1D3557] blur-[140px] opacity-40" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-[#457B9D] blur-[150px] opacity-30" />

      <div className="relative w-full max-w-md animate-fade-in z-10">
        <Card className="border border-border/70 bg-card shadow-2xl">
          <CardHeader className="space-y-3 text-center pb-4 pt-8">
            <div className="mx-auto mb-2 flex justify-center">
              <BrandLogo size="xl" showText={false} href="/" />
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                  Super Admin Portal
                </CardTitle>
                <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/30 text-[10px] font-bold">
                  ROOT
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Authorized platform administrative access only.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/15 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="dev@sakarsa.com"
                    className="pl-9 h-11 bg-background text-foreground border-border text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground">Admin Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="pl-9 h-11 bg-background text-foreground border-border text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-primary hover:opacity-90 text-white font-semibold text-sm gap-2 shadow-lg shadow-primary/30 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Sign In to Command Center
                  </>
                )}
              </Button>
            </form>

            <div className="pt-3 border-t border-border/50 text-center">
              <Link
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Return to Public Website
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
