"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getRedirectPath } from "@/lib/redirects";
import { Loader2, Building2 } from "lucide-react";

export function RedirectHandler({ children }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  const syncUser = useMutation(api.users.syncUser);

  const convexUser = useQuery(
    api.users.getByClerkId,
    user ? { clerkUserId: user.id } : "skip"
  );

  const isLoading =
    !isLoaded || (isLoaded && user && convexUser === undefined);

  // Sync Clerk user → Convex
  useEffect(() => {
    if (user && convexUser === null) {
      syncUser({
        clerkUserId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || "User",
      }).catch(console.error);
    }
  }, [user, convexUser, syncUser]);

  useEffect(() => {
    if (hasRedirected) return;
    if (isLoading) return;

    const redirectPath = getRedirectPath({
      user: convexUser ?? null,
      isLoading: false,
      currentPath: pathname || "/",
    });

    if (redirectPath && redirectPath !== pathname) {
      setHasRedirected(true);
      router.replace(redirectPath);
    }
  }, [convexUser, isLoading, pathname, router, hasRedirected]);

  if (isLoading && !pathname?.startsWith("/auth/")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0A0A0F]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#c9a634] flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <Building2 className="w-8 h-8 text-black" />
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-sm">Loading your account...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}