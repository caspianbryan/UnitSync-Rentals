"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function SyncUserToConvex() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const syncUser = useMutation(api.users.syncUser);
  const dbUser = useQuery(api.users.getByClerkId, user ? { clerkUserId: user.id } : undefined);
  console.log('db user query ==', dbUser);
  

  useEffect(() => {
    if (!isLoaded) return;        // Wait for Clerk session
    if (!user) return;            // Not signed in yet
    if (pathname.startsWith("/sign-in")) return; // Prevent loop from sign-in

    const redirectFlow = async () => {
      try {
        // Sync user in your DB
        await syncUser({
          clerkUserId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          name: user.fullName || undefined,
        });

        // If dbUser is not loaded yet, don't redirect
        if (dbUser === undefined) return;

        // Redirect logic
        if (!dbUser) {
          // First-time user: go to onboarding
          router.replace("/onboarding");
        } else if (dbUser.isAdmin) {
          router.replace("/dashboard");
        } else if (dbUser.isTenant) {
          router.replace("/tenant");
        }
      } catch (error) {
        console.error("Error syncing user:", error);
      }
    };

    redirectFlow();
  }, [user, isLoaded, dbUser, syncUser, router, pathname]);

  return null;
}