"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthSync() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const dbUser = useQuery(
    api.users.getByClerkId,
    user && isLoaded ? { clerkUserId: user.id } : "skip"
  );

  useEffect(() => {
    if (!isLoaded || !user || !dbUser) return;

    // Don't redirect if already on the correct page
    if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/tenant') || pathname?.startsWith('/onboarding')) {
      // Verify user is on the correct dashboard
      if (pathname?.startsWith('/dashboard') && !dbUser.isAdmin) {
        // Landlord page but not admin - redirect appropriately
        if (dbUser.isTenant) {
          router.push('/tenant');
        } else {
          router.push('/onboarding');
        }
      } else if (pathname?.startsWith('/tenant') && !dbUser.isTenant) {
        // Tenant page but not tenant - redirect appropriately
        if (dbUser.isAdmin) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }
      return;
    }

    // User is on home page or other page - route them
    if (dbUser.isAdmin) {
      router.push('/dashboard');
    } else if (dbUser.isTenant) {
      router.push('/tenant');
    } else {
      // No role selected yet
      router.push('/onboarding');
    }
  }, [user, isLoaded, dbUser, pathname, router]);

  return null;
}