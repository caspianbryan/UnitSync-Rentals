"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export default function RoleRedirect() {
  const router = useRouter();
  const { user, isSignedIn } = useUser();

  const convexUser = useQuery(
    api.users.getByClerkId,
    user ? { clerkUserId: user.id } : "skip"
  );

  useEffect(() => {
    if (!isSignedIn) return;

    if (!convexUser) return; // still loading

    if (!convexUser.isAdmin && !convexUser.isTenant) {
      router.replace("/select-role"); // optional first-time page
      return;
    }

    if (convexUser.isAdmin) router.replace("/dashboard");
    else if (convexUser.isTenant) router.replace("/tenant/dashboard");
  }, [convexUser, isSignedIn, router]);

  return null; // nothing renders
}
