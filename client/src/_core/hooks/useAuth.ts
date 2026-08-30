import { getLoginUrl } from "@/const";
import { useCallback, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

export type AuthUser = {
  id?: number;
  openId: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  loginMethod?: string | null;
};

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false } = options ?? {};
  const redirectPath = options?.redirectPath;

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me", {
        headers: { "Accept": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("agentlab_user", JSON.stringify(data.user));
        } else {
          setUser(null);
          localStorage.removeItem("agentlab_user");
        }
      } else {
        setUser(null);
      }
    } catch (err: any) {
      console.warn("[Auth] Check auth warning:", err);
      // Check localStorage fallback
      const cached = localStorage.getItem("agentlab_user");
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      localStorage.removeItem("agentlab_user");
      localStorage.removeItem("manus-runtime-token");
    } catch (err: any) {
      setError(err);
      throw err;
    }
  }, []);

  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (isAuthenticated) return;
    if (typeof window === "undefined") return;
    const destination = redirectPath ?? getLoginUrl();
    if (window.location.pathname === destination) return;

    window.location.href = destination;
  }, [redirectOnUnauthenticated, redirectPath, loading, isAuthenticated]);

  return {
    user,
    loading,
    isLoading: loading,
    error,
    isAuthenticated,
    refresh: checkAuth,
    logout,
  };

}

