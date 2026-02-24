
// ============================================================
// FILE: app/sign-up/[[...sign-up]]/page.jsx
// Custom Clerk sign-up page with UnitSync theme
// ============================================================

import { SignUp } from "@clerk/nextjs";
import { Building2 } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] pointer-events-none" />
      
      {/* Gradient orbs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-[#D4AF37]/10 dark:bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#c9a634] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <Building2 className="w-6 h-6 text-black" />
            </div>
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              Unit<span className="text-[#D4AF37]">Sync</span>
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Create your account to get started
          </p>
        </div>

        {/* Clerk component */}
        <div className="relative">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-2xl shadow-black/10 dark:shadow-black/30 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#13131A]",
                
                headerTitle: "font-bold text-slate-900 dark:text-white text-xl",
                headerSubtitle: "text-slate-600 dark:text-slate-400 text-sm",
                
                socialButtonsBlockButton: `
                  rounded-xl h-11 border border-slate-200 dark:border-white/10
                  bg-white dark:bg-[#0A0A0F]
                  hover:bg-slate-50 dark:hover:bg-white/5
                  text-slate-700 dark:text-slate-300
                  font-medium transition-all
                `,
                socialButtonsBlockButtonText: "font-medium text-sm",
                
                dividerLine: "bg-slate-200 dark:bg-white/10",
                dividerText: "text-xs font-medium text-slate-500 dark:text-slate-400 uppercase",
                
                formFieldLabel: "text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2",
                formFieldInput: `
                  rounded-xl h-11 px-4 text-sm
                  bg-slate-50 dark:bg-[#0A0A0F]
                  border border-slate-200 dark:border-white/10
                  text-slate-900 dark:text-white
                  placeholder:text-slate-400
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#D4AF37]/50
                  focus:border-[#D4AF37]
                  transition-all
                `,
                formFieldInputShowPasswordButton: "text-[#D4AF37] hover:text-[#c9a634]",
                
                formButtonPrimary: `
                  rounded-xl h-11 font-semibold text-sm
                  bg-[#D4AF37] hover:bg-[#c9a634] active:bg-[#b8941f]
                  text-black
                  shadow-lg shadow-[#D4AF37]/20
                  transition-all
                `,
                
                footerActionText: "text-sm text-slate-600 dark:text-slate-400",
                footerActionLink: "text-[#D4AF37] hover:text-[#c9a634] font-semibold transition-colors",
                footer: "border-t border-slate-200 dark:border-white/10 mt-6 pt-6",
                
                otpCodeFieldInput: `
                  rounded-xl h-12 w-12 text-center text-lg font-bold
                  border border-slate-200 dark:border-white/10
                  bg-slate-50 dark:bg-[#0A0A0F]
                  focus:border-[#D4AF37]
                  focus:ring-2
                  focus:ring-[#D4AF37]/50
                `,
                
                formResendCodeLink: "text-[#D4AF37] hover:text-[#c9a634] font-medium",
                formFieldErrorText: "text-xs text-red-500 mt-1",
                alertText: "text-sm",
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            By continuing, you agree to UnitSync's{" "}
            <a href="#" className="text-[#D4AF37] hover:underline font-medium">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#D4AF37] hover:underline font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}