"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, Loader2, Eye, EyeOff, User, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [step, setStep] = useState("form"); // "form" | "verify"
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  async function handleSignUp(e) {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    try {
      await signUp.create({
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || "",
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
      toast.success("Verification code sent to your email");
    } catch (err) {
      toast.error(err.errors?.[0]?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Account created! Setting up your workspace…");
        router.push("/onboarding");
      } else {
        toast.error("Verification incomplete. Please try again.");
      }
    } catch (err) {
      toast.error(err.errors?.[0]?.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  }

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ["transparent", "#EF4444", "#F59E0B", "#10B981"];
  const strengthLabels = ["", "Weak", "Good", "Strong"];

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

        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none",
          marginBottom: 32, transition: "color 0.2s"
        }}>
          <ArrowLeft size={14} /> Back to home
        </Link>

        {/* Logo */}
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
            {step === "form" ? "Create your account" : "Verify your email"}
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
            {step === "form" ? "Start managing your properties for free" : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: 32
        }}>

          {step === "form" ? (
            <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Name */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
                  Full name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={16} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="John Kamau" required className="auth-input" disabled={isLoading} />
                </div>
              </div>

              {/* Email */}
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

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters" required
                    className="auth-input" style={{ paddingRight: 44 }} disabled={isLoading}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 4 }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password && (
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(passwordStrength / 3) * 100}%`, background: strengthColors[passwordStrength], borderRadius: 2, transition: "all 0.3s" }} />
                    </div>
                    <span style={{ fontSize: 11, color: strengthColors[passwordStrength], fontWeight: 500 }}>{strengthLabels[passwordStrength]}</span>
                  </div>
                )}
              </div>

              <button type="submit" disabled={isLoading || !name || !email || !password}
                className="btn-gold"
                style={{ width: "100%", padding: "13px", borderRadius: 10, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
                {isLoading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Creating account...</> : "Create free account"}
              </button>

              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", lineHeight: 1.6 }}>
                By signing up you agree to our{" "}
                <a href="#" style={{ color: "rgba(212,175,55,0.7)", textDecoration: "none" }}>Terms of Service</a>{" "}
                and{" "}
                <a href="#" style={{ color: "rgba(212,175,55,0.7)", textDecoration: "none" }}>Privacy Policy</a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{
                background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)",
                borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 10
              }}>
                <CheckCircle2 size={16} color="#D4AF37" style={{ marginTop: 1, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                  Check your inbox for a 6-digit verification code and enter it below.
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
                  Verification code
                </label>
                <input
                  type="text" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000" required maxLength={6}
                  className="auth-input-no-icon" disabled={isLoading}
                />
              </div>

              <button type="submit" disabled={isLoading || code.length !== 6}
                className="btn-gold"
                style={{ width: "100%", padding: "13px", borderRadius: 10, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {isLoading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Verifying...</> : "Verify & continue"}
              </button>

              <button type="button" onClick={() => setStep("form")}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", textAlign: "center" }}>
                ← Back to sign up
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
          Already have an account?{" "}
          <Link href="/auth/signin" style={{ color: "#D4AF37", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}