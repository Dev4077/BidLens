"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      if (data.session) {
        router.push("/dashboard");
      }
    } catch {
      setErrorMsg("An unexpected error occurred during authentication.");
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
          <h1 className="text-2xl font-bold text-foreground">Welcome to BidLens</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to access your proposals and client pipeline
          </p>
        </CardHeader>
        <CardContent className="space-y-4 px-8 pb-8">
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
                  className="pl-10 h-10 bg-background text-foreground border-border text-sm"
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
                  placeholder="••••••••"
                  className="pl-10 h-10 bg-background text-foreground border-border text-sm"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="outline"
              className="w-full h-10 border-border text-foreground hover:bg-accent font-medium gap-2 text-xs cursor-pointer"
              disabled={isLoading}
            >
              Sign In with Credentials
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center text-xs font-semibold text-primary hover:underline"
            >
              Don&apos;t have an account? Sign up free →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
