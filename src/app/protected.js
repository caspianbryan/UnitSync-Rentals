"use client";

import { useUser, RedirectToSignIn } from "@clerk/nextjs";

export default function Protected({ children }) {
  const { isSignedIn } = useUser();

  if (!isSignedIn) return <RedirectToSignIn />;

  return children;
}
