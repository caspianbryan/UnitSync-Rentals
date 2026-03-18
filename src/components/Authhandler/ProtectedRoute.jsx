"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

/**
 * ProtectedRoute - Wrap around route-specific components
 * More granular than RedirectHandler
 */
export function ProtectedRoute({ 
  children, 
  allowedRoles,
  fallbackPath = "/"
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const convexUser = useQuery(
    api.users.getByClerkId,
    user ? { clerkUserId: user.id } : "skip"
  );

  const isLoading = !isLoaded || (user && convexUser === undefined);

  useEffect(() => {
    // Not authenticated
    if (isLoaded && !user) {
      router.push("/sign-in");
      return;
    }

    // Onboarding not completed
    if (convexUser && !convexUser.onboardingCompleted) {
      router.push("/onboarding");
      return;
    }

    // Wrong role
    if (convexUser && !allowedRoles.includes(convexUser.role)) {
      router.push(fallbackPath);
      return;
    }
  }, [isLoaded, user, convexUser, allowedRoles, fallbackPath, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0A0A0F]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#D4AF37] mx-auto mb-4" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Access denied
  if (convexUser && !allowedRoles.includes(convexUser.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0A0A0F] p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You don't have permission to access this page.
            {allowedRoles.length === 1 && (
              <> This page requires {allowedRoles[0]} access.</>
            )}
          </p>
          <button
            onClick={() => router.push(fallbackPath)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#c9a634] text-black font-semibold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}

// ──────────────────────────────────────────────────────────
// Convenience wrappers for specific roles
// ──────────────────────────────────────────────────────────
export function AdminRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      {children}
    </ProtectedRoute>
  );
}

export function LandlordRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={["admin", "landlord"]}>
      {children}
    </ProtectedRoute>
  );
}

export function TenantRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={["tenant"]} fallbackPath="/dashboard">
      {children}
    </ProtectedRoute>
  );
}

export function DashboardRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={["admin", "landlord", "manager"]}>
      {children}
    </ProtectedRoute>
  );
}