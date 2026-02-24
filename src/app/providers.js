"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// Gold theme variables shared across both modes
const goldTheme = {
  variables: {
    colorPrimary: "#D4AF37",
    colorTextOnPrimaryBackground: "#000000",
    colorDanger: "#ef4444",
    borderRadius: "12px",
    fontFamily: "inherit",
  },
  elements: {
    // Card container
    card: `
      shadow-2xl shadow-black/20
      border border-[#D4AF37]/20
      rounded-2xl
      overflow-hidden
    `,

    // Header
    headerTitle: "font-bold tracking-tight",
    headerSubtitle: "text-sm",

    // Logo area
    logoBox: "mb-2",

    // Form fields
    formFieldLabel: "text-sm font-medium mb-1",
    formFieldInput: `
      rounded-xl
      border
      h-11
      px-4
      text-sm
      transition-all
      focus:ring-2
      focus:ring-[#D4AF37]/50
      focus:border-[#D4AF37]
      outline-none
    `,
    formFieldInputShowPasswordButton: "text-[#D4AF37]",

    // Primary button (Sign in / Continue)
    formButtonPrimary: `
      h-11
      rounded-xl
      bg-[#D4AF37]
      text-black
      font-semibold
      text-sm
      hover:bg-[#c9a634]
      active:bg-[#b8941f]
      transition-all
      shadow-lg
      shadow-[#D4AF37]/20
      border-0
    `,

    // Social buttons (Google, GitHub, etc.)
    socialButtonsBlockButton: `
      h-11
      rounded-xl
      border
      font-medium
      text-sm
      transition-all
      hover:border-[#D4AF37]/50
    `,
    socialButtonsBlockButtonText: "font-medium",

    // Divider
    dividerLine: "bg-[#D4AF37]/20",
    dividerText: "text-xs font-medium",

    // Footer links
    footerActionText: "text-sm",
    footerActionLink: "text-[#D4AF37] hover:text-[#c9a634] font-semibold transition-colors",
    footer: "border-t border-[#D4AF37]/10",

    // Internal navigation (sign in / sign up tabs)
    navbarButton: "font-medium",
    formResendCodeLink: "text-[#D4AF37] hover:text-[#c9a634]",

    // OTP / verification inputs
    otpCodeFieldInput: `
      rounded-xl
      border
      h-12
      w-12
      text-lg
      font-bold
      focus:border-[#D4AF37]
      focus:ring-2
      focus:ring-[#D4AF37]/50
    `,

    // Alerts
    alertText: "text-sm",
    formFieldErrorText: "text-xs text-red-500 mt-1",

    // User button popup
    userButtonPopoverCard: "rounded-2xl border border-[#D4AF37]/20 shadow-2xl",
    userButtonPopoverActionButton: "rounded-xl hover:bg-[#D4AF37]/10",
    userButtonPopoverActionButtonText: "font-medium",
    userButtonPopoverActionButtonIcon: "text-[#D4AF37]",
    userButtonPopoverFooter: "border-t border-[#D4AF37]/10",
  },
};

export default function Providers({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#D4AF37",
          colorBackground: "#0A0A0F",
          colorInputBackground: "#13131A",
          colorText: "#E6E6E6",
          colorTextSecondary: "#9CA3AF",
          colorInputText: "#E6E6E6",
          colorNeutral: "#9CA3AF",
          ...goldTheme.variables,
        },
        elements: {
          ...goldTheme.elements,
          formButtonPrimary: "bg-[#D4AF37] text-black hover:bg-[#c9a634]",
          card: `
            ${goldTheme.elements.card}
            bg-[#13131A]
          `,
          headerTitle: `${goldTheme.elements.headerTitle} text-white`,
          headerSubtitle: `${goldTheme.elements.headerSubtitle} text-[#9CA3AF]`,
          formFieldLabel: `${goldTheme.elements.formFieldLabel} text-[#E6E6E6]`,
          formFieldInput: `
            ${goldTheme.elements.formFieldInput}
            bg-[#0A0A0F]
            border-white/10
            text-white
            placeholder:text-[#9CA3AF]/60
          `,
          socialButtonsBlockButton: `
            ${goldTheme.elements.socialButtonsBlockButton}
            bg-[#0A0A0F]
            border-white/10
            text-white
            hover:bg-white/5
          `,
          dividerText: `${goldTheme.elements.dividerText} text-[#9CA3AF]`,
          footerActionText: `${goldTheme.elements.footerActionText} text-[#9CA3AF]`,
          userButtonPopoverCard: `${goldTheme.elements.userButtonPopoverCard} bg-[#13131A]`,
          userButtonPopoverActionButton: `${goldTheme.elements.userButtonPopoverActionButton} text-[#E6E6E6] hover:bg-white/5`,
          userButtonPopoverActionButtonText: `${goldTheme.elements.userButtonPopoverActionButtonText} text-[#E6E6E6]`,
        },
      }}
    >
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </ClerkProvider>
  );
}