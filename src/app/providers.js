"use client";

import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL
);

export default function Providers({ children }) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      appearance={{ baseTheme: dark }}
    >
      <ConvexProvider client={convex}>
        {children}
      </ConvexProvider>
    </ClerkProvider>
  );
}