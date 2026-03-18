"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getRedirectPath } from "@/lib/redirects";
import { Loader2, Building2 } from "lucide-react";

export function RedirectHandler({ children }) {
  const { user, isLoaded: clerkLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  // ✅ FIX: Only query if user exists
  const convexUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  // ✅ FIX: Proper loading state
  const isLoadingClerk = !clerkLoaded;
  const isLoadingConvex = user && convexUser === undefined;
  const isLoading = isLoadingClerk || isLoadingConvex;

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("🔍 RedirectHandler State:", {
        pathname,
        clerkLoaded,
        hasClerkUser: !!user,
        clerkUserId: user?.id,
        convexUser: convexUser === undefined ? "⏳ loading" :
          convexUser === null ? "❌ not found" :
            "✅ found",
        isLoading,
        hasRedirected,
      });
    }
  }, [clerkLoaded, user, convexUser, pathname, isLoading, hasRedirected]);

  // Handle redirects
  useEffect(() => {
    // Skip if already redirected
    if (hasRedirected) return;

    // Skip if still loading
    if (isLoading) return;

    // Skip if on auth pages
    if (pathname?.startsWith("/auth/")) return;

    // ✅ FIX: Pass user or null (not undefined)
    const userForRedirect = user ? (convexUser ?? null) : null;

    const redirectPath = getRedirectPath({
      user: userForRedirect,
      isLoading: false,
      currentPath: pathname || "/",
    });

    if (redirectPath && redirectPath !== pathname) {
      console.log(`🔀 Redirecting: ${pathname} → ${redirectPath}`);
      setHasRedirected(true);

      setTimeout(() => {
        router.push(redirectPath);
      }, 100);
    }
  }, [convexUser, isLoading, pathname, router, hasRedirected, user]);

  // Show loading screen
  if (isLoading && pathname !== "/" && !pathname?.startsWith("/auth/")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0A0A0F]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#c9a634] flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <Building2 className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            UnitSync
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-sm">
              {isLoadingClerk ? "Authenticating..." : "Loading workspace..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
