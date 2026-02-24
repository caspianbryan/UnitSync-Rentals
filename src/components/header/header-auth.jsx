// ============================================================
// FILE 2: header-auth.jsx  (components/header/header-auth.jsx)
// ============================================================
"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../../app/ThemeToggle";
import { LogIn, Building2 } from "lucide-react";

export default function HeaderAuth() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-3">
        <ThemeToggle className="md:hidden" />
        <div className="w-20 h-9 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <ThemeToggle className="md:hidden" />

      {/* Not signed in */}
      {!isSignedIn && (
        <SignInButton mode="modal" forceRedirectUrl="/onboarding">
          <Button
            className="
              flex items-center gap-2
              rounded-full
              h-10 px-5
              bg-[#D4AF37]
              text-black
              font-semibold
              text-sm
              hover:bg-[#c9a634]
              active:bg-[#b8941f]
              transition-all
              shadow-lg shadow-[#D4AF37]/20
              border-0
            "
          >
            <LogIn className="w-4 h-4" />
            Sign in
          </Button>
        </SignInButton>
      )}

      {/* Signed in — styled user button */}
      {isSignedIn && (
        <div className="flex items-center gap-3">
          {/* Name greeting — hidden on mobile */}
          <div className="hidden md:block text-right">
            <p className="text-xs text-slate-500 dark:text-[#9CA3AF]">Signed in as</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
              {user?.firstName || user?.username || "User"}
            </p>
          </div>

          {/* Gold ring user avatar */}
          <div
            className="
              rounded-full
              p-0.5
              bg-gradient-to-br from-[#D4AF37] via-[#F4E5C3] to-[#D4AF37]
              shadow-lg shadow-[#D4AF37]/20
              hover:shadow-[#D4AF37]/40
              transition-all
            "
          >
            <div className="rounded-full bg-[#0A0A0F] p-0.5">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 rounded-full",
                    userButtonPopoverCard:
                      "rounded-2xl border border-[#D4AF37]/20 shadow-2xl bg-[#13131A]",
                    userButtonPopoverActionButton:
                      "rounded-xl hover:bg-white/5 text-[#E6E6E6]",
                    userButtonPopoverActionButtonText:
                      "font-medium text-[#E6E6E6]",
                    userButtonPopoverActionButtonIcon: "text-[#D4AF37]",
                    userButtonPopoverFooter: "border-t border-[#D4AF37]/10",
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ============================================================
// FILE 3: landing page sign-in button (replace existing ones)
// Use this in your Home/LuxuryLanding component
// ============================================================

// Hero CTA button — gold filled
export function GoldSignInButton({ label = "Start free trial", size = "lg" }) {
  return (
    <SignInButton mode="modal" forceRedirectUrl="/onboarding">
      <Button
        size={size}
        className="
          rounded-full
          bg-[#D4AF37]
          text-black
          hover:bg-[#c9a634]
          active:bg-[#b8941f]
          font-semibold
          shadow-xl shadow-[#D4AF37]/30
          hover:shadow-[#D4AF37]/50
          transition-all
          border-0
          px-8 h-14 text-base
        "
      >
        {label}
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </SignInButton>
  );
}

// Ghost outline variant (for secondary CTAs)
export function OutlineSignInButton({ label = "Watch demo" }) {
  return (
    <SignInButton mode="modal" forceRedirectUrl="/onboarding">
      <Button
        size="lg"
        variant="outline"
        className="
          rounded-full
          border-[#D4AF37]/40
          text-[#D4AF37]
          hover:bg-[#D4AF37]/10
          hover:border-[#D4AF37]
          font-semibold
          transition-all
          px-8 h-14 text-base
        "
      >
        {label}
      </Button>
    </SignInButton>
  );
}