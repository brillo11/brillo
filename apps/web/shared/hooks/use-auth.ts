"use client";

import { authClient } from "@/shared/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PATH } from "@/shared/consts/path";

interface UseAuthOptions {
  requireAuth?: boolean;
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { data: session, isPending, error } = authClient.useSession();
  const router = useRouter();

  const isAuthenticated = !!session?.user;
  const isLoading = isPending;

  useEffect(() => {
    if (options.requireAuth && !isLoading && !isAuthenticated) {
      router.push(options.redirectTo || PATH.AUTH_LOGIN);
    }
  }, [isAuthenticated, isLoading, options.requireAuth, options.redirectTo, router]);

  return {
    session,
    user: session?.user,
    isAuthenticated,
    isLoading,
    error,
    signIn: authClient.signIn,
    signOut: authClient.signOut,
    signUp: authClient.signUp,
  };
}

