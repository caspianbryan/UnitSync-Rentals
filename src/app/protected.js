"use client";

import { useUser, RedirectToSignIn } from "@clerk/nextjs";

export default function Protected({ children }) {
  const { isSignedIn, isLoaded } = useUser();

  // Wait for Clerk to finish loading
  if (!isLoaded) return null;

  if (!isSignedIn) return <RedirectToSignIn />;

  return children;
}