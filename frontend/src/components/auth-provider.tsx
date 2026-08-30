"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: any | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signInWithDemo: () => void;
  signInAsAdmin: (email: string, pass: string) => boolean;
  token: string | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/admin/login"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    // Check localStorage for active session
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("bidlens_auth_user") : null;
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("bidlens_auth_token") : null;
    
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        const resolvedToken = storedToken || `user-token:${parsed.id}:${parsed.email}`;
        setDemoToken(resolvedToken);
        setIsLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem("bidlens_auth_user");
        localStorage.removeItem("bidlens_auth_token");
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        setUser(currentSession.user);
        setDemoToken(currentSession.access_token || `user-token:${currentSession.user.id}:${currentSession.user.email}`);
      } else if (!storedUser) {
        setUser(null);
        setDemoToken(null);
      }
      setIsLoading(false);
      
      if (!currentSession && !storedUser && !PUBLIC_ROUTES.includes(pathname) && !pathname.startsWith("/onboarding")) {
        router.push("/login");
      }
    });

    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      if (!storedUser) {
        setSession(initSession);
        if (initSession?.user) {
          setUser(initSession.user);
          setDemoToken(initSession.access_token || `user-token:${initSession.user.id}:${initSession.user.email}`);
        }
        setIsLoading(false);
        if (!initSession && !PUBLIC_ROUTES.includes(pathname) && !pathname.startsWith("/onboarding")) {
          router.push("/login");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, pathname]);

  const signInAsAdmin = (email: string, pass: string): boolean => {
    if (email.trim().toLowerCase() === "dev@sakarsa.com" && pass === "password123") {
      const adminUser: any = {
        id: "00000000-0000-0000-0000-000000000001",
        email: "dev@sakarsa.com",
        user_metadata: {
          full_name: "Sakarsa Super Admin",
          role: "admin",
        },
        app_metadata: {
          role: "admin",
        },
        aud: "authenticated",
        created_at: new Date().toISOString(),
      };
      localStorage.setItem("bidlens_auth_user", JSON.stringify(adminUser));
      localStorage.setItem("bidlens_auth_token", "admin-token");
      setUser(adminUser);
      setDemoToken("admin-token");
      setIsLoading(false);
      router.push("/admin");
      return true;
    }
    return false;
  };

  const signInWithDemo = () => {
    const demoId = "usr-demo-freelancer";
    const demoEmail = "user@bidlens.ai";
    const regularUser: any = {
      id: demoId,
      email: demoEmail,
      user_metadata: {
        full_name: "Freelancer Pro",
      },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    };
    const scopedToken = `user-token:${demoId}:${demoEmail}`;
    localStorage.setItem("bidlens_auth_user", JSON.stringify(regularUser));
    localStorage.setItem("bidlens_auth_token", scopedToken);
    setUser(regularUser);
    setDemoToken(scopedToken);
    setIsLoading(false);
    router.push("/");
  };

  const signOut = async () => {
    localStorage.removeItem("bidlens_auth_user");
    localStorage.removeItem("bidlens_auth_token");
    setUser(null);
    setSession(null);
    setDemoToken(null);
    await supabase.auth.signOut().catch(() => {});
    router.push("/login");
  };

  const activeToken = session?.access_token || demoToken || (user ? `user-token:${user.id}:${user.email}` : null);
  const isAdmin = (user?.email || "").toLowerCase() === "dev@sakarsa.com" || user?.user_metadata?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signOut,
        signInWithDemo,
        signInAsAdmin,
        token: activeToken,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
