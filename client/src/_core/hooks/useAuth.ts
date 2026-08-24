import { getLoginUrl } from "@/const";
import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../firebase";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false } = options ?? {};
  const redirectPath = options?.redirectPath;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem("manus-runtime-token", token);
          setUser(firebaseUser);
        } else {
          localStorage.removeItem("manus-runtime-token");
          setUser(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
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
    error,
    isAuthenticated,
    refresh: async () => {
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
      }
    },
    logout,
  };
}
