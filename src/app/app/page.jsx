"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppGate() {
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();

  // Sync user to Convex DB
  const syncUser = useMutation(api.users.syncUser);

  const dbUser = useQuery(
    api.users.getByClerkId,
    user ? { clerkUserId: user.id } : "skip"
  );

  // Sync Clerk user to Convex once
  useEffect(() => {
    if (!user) return;
    syncUser({
      clerkUserId: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "",
    });
  }, [user, syncUser]);

  // Redirect based on sign-in status & role
  useEffect(() => {
    if (!isLoaded) return; // wait for Clerk
    if (!isSignedIn) {
      router.replace("/sign-in");
      return;
    }

    if (!dbUser) return; // still loading from Convex

    // No role yet → onboarding
    if (!dbUser.isAdmin && !dbUser.isTenant) {
      router.replace("/select-role");
      return;
    }

    if (dbUser.isAdmin) {
      router.replace("/dashboard");
      return;
    }

    if (dbUser.isTenant) {
      router.replace("/tenant/dashboard");
      return;
    }

  }, [isLoaded, isSignedIn, dbUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Preparing your workspace…
    </div>
  );
}
