"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState("email"); // "email" | "reset"
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSendCode(e) {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("reset");
      toast.success("Reset code sent to your email");
    } catch (err) {
      toast.error(err.errors?.[0]?.message || "Email not found");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Password reset successfully!");
        router.push("/");
      } else {
        toast.error("Reset incomplete. Please try again.");
      }
    } catch (err) {
      toast.error(err.errors?.[0]?.message || "Invalid code or password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#09090E", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24,
      fontFamily: "'DM Sans', sans-serif", position: "relative"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .auth-input {
          width: 100%; padding: 12px 16px 12px 44px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: white; font-size: 14px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'DM Sans', sans-serif; box-sizing: border-box;
        }
        .auth-input:focus {
          border-color: rgba(212,175,55,0.5);
          box-shadow: 0 0 0 3px rgba(212,175,55,0.08);
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.25); }
        .auth-input-no-icon {
          width: 100%; padding: 12px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: white; font-size: 15px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'DM Sans', sans-serif; box-sizing: border-box;
          text-align: center; letter-spacing: 0.2em;
        }
        .auth-input-no-icon:focus {
          border-color: rgba(212,175,55,0.5);
          box-shadow: 0 0 0 3px rgba(212,175,55,0.08);
        }
        .btn-gold {
          background: linear-gradient(135deg, #D4AF37, #c9a634);
          color: black; font-weight: 600; border: none; cursor: pointer;
          transition: all 0.2s ease; box-shadow: 0 4px 20px rgba(212,175,55,0.3);
          font-family: 'DM Sans', sans-serif;
        }
        .btn-gold:hover:not(:disabled) {
          box-shadow: 0 8px 30px rgba(212,175,55,0.4);
          transform: translateY(-1px);
        }
        .btn-gold:disabled { opacity: 0.6; cursor: not-allowed; }
        .grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="grain" />
      <div style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 500, height: 300, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}>

        <Link href="/auth/signin" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none",
          marginBottom: 32
        }}>
          <ArrowLeft size={14} /> Back to sign in
        </Link>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #D4AF37, #c9a634)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <Building2 size={26} color="black" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "white", marginBottom: 6, letterSpacing: "-0.02em" }}>
            {step === "email" ? "Reset your password" : "Set new password"}
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
            {step === "email"
              ? "Enter your email and we'll send a reset code"
              : `Enter the code sent to ${email} and your new password`}
          </p>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: 32
        }}>
          {step === "email" ? (
            <form onSubmit={handleSendCode} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
                  Email address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required className="auth-input" disabled={isLoading} />
                </div>
              </div>

              <button type="submit" disabled={isLoading || !email} className="btn-gold"
                style={{ width: "100%", padding: "13px", borderRadius: 10, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {isLoading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Sending...</> : "Send reset code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{
                background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)",
                borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 10
              }}>
                <CheckCircle2 size={16} color="#D4AF37" style={{ marginTop: 1, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                  Code sent! Check your inbox and enter it below along with your new password.
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
                  Reset code
                </label>
                <input type="text" value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000" required maxLength={6}
                  className="auth-input-no-icon" disabled={isLoading} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
                  New password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters" required
                    className="auth-input" style={{ paddingRight: 44 }} disabled={isLoading}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 4 }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading || code.length !== 6 || !newPassword} className="btn-gold"
                style={{ width: "100%", padding: "13px", borderRadius: 10, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {isLoading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Resetting...</> : "Reset password"}
              </button>

              <button type="button" onClick={() => setStep("email")}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", textAlign: "center" }}>
                ← Try a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}