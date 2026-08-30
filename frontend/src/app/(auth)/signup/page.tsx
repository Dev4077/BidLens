"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { authApi } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        console.warn("Supabase signup note:", error.message);
      }

      const userId = data?.user?.id || `usr-${Date.now()}`;

      // Sync to backend database & admin records
      await authApi.syncSignup({
        id: userId,
        email: email.toLowerCase(),
        full_name: name,
        tier: "free",
      }).catch((err) => console.warn("Backend auth sync notice:", err));

      // Store local session for onboarding
      const newUser = {
        id: userId,
        email: email.toLowerCase(),
        user_metadata: {
          full_name: name,
        },
        created_at: new Date().toISOString(),
      };

      localStorage.setItem("bidlens_auth_user", JSON.stringify(newUser));
      localStorage.setItem("bidlens_auth_token", "demo-token");
      
      router.push("/onboarding");
    } catch (err: any) {
      console.error("Signup error:", err);
      setErrorMsg(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-0 -left-40 w-96 h-96 rounded-full bg-[#1D3557] blur-[140px] opacity-35" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-[#457B9D] blur-[150px] opacity-25" />

      <Card className="relative w-full max-w-md border border-border/70 bg-card shadow-2xl z-10">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto mb-3 flex justify-center">
            <BrandLogo size="xl" showText={false} href="/" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Start generating winning proposals with AI
          </p>
        </CardHeader>
        <CardContent className="space-y-4 px-8 pb-8">
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-medium text-foreground">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="pl-10 h-11 bg-background text-foreground border-border text-sm"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 h-11 bg-background text-foreground border-border text-sm"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="pl-10 h-11 bg-background text-foreground border-border text-sm"
                  minLength={6}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:opacity-90 text-white font-semibold gap-2 shadow-lg shadow-primary/30 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create Account & Setup Profile
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
