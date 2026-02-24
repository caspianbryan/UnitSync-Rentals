"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function SyncUserToConvex() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const sync = async () => {
      try {
        await syncUser({
          clerkUserId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          name: user.fullName || undefined,
        });

        // Only redirect to onboarding if:
        // 1. User just signed in
        // 2. Not already on onboarding, dashboard, or tenant pages
        const protectedPaths = ['/onboarding', '/dashboard', '/tenant'];
        const isOnProtectedPath = protectedPaths.some(path => pathname?.startsWith(path));

        if (!isOnProtectedPath && pathname === '/') {
          // Redirect new users to onboarding
          router.push('/onboarding');
        }
      } catch (error) {
        console.error("Error syncing user:", error);
      }
    };

    sync();
  }, [user, isLoaded, syncUser, router, pathname]);

  return null;
}