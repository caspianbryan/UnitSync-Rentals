"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  Building2, ArrowRight, CheckCircle2, TrendingUp, Users,
  Wrench, DollarSign, Shield, Zap, Star, ChevronRight,
  BarChart3, Bell, FileText, Smartphone
} from "lucide-react";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen bg-[#09090E] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');
        
        .gold { color: #D4AF37; }
        .gold-bg { background: #D4AF37; }
        .gold-border { border-color: #D4AF37; }
        
        .grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 100; opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }
        
        .mesh {
          background: radial-gradient(ellipse 80% 50% at 20% 20%, rgba(212,175,55,0.08) 0%, transparent 60%),
                      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(59,130,246,0.05) 0%, transparent 60%);
        }
        
        .card-hover {
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          border-color: rgba(212,175,55,0.4);
          box-shadow: 0 20px 60px rgba(212,175,55,0.08);
        }
        
        .btn-gold {
          background: linear-gradient(135deg, #D4AF37, #c9a634);
          color: black;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(212,175,55,0.3);
        }
        .btn-gold:hover {
          background: linear-gradient(135deg, #e0bc40, #D4AF37);
          box-shadow: 0 8px 30px rgba(212,175,55,0.4);
          transform: translateY(-1px);
        }
        
        .fade-up {
          animation: fadeUp 0.7s ease forwards;
          opacity: 0;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        
        .line-gold {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent);
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
        }

        .feature-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          background: rgba(212,175,55,0.1);
          border: 1px solid rgba(212,175,55,0.2);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }

        .testimonial-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 28px;
        }

        .pricing-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 36px;
          transition: all 0.3s ease;
        }
        .pricing-card.featured {
          background: rgba(212,175,55,0.06);
          border-color: rgba(212,175,55,0.3);
          box-shadow: 0 0 60px rgba(212,175,55,0.06);
        }

        .nav-link {
          color: rgba(255,255,255,0.6);
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover { color: white; }

        .hero-display {
          font-family: 'Playfair Display', serif;
          line-height: 1.05;
        }

        .pill {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px;
          border-radius: 100px;
          border: 1px solid rgba(212,175,55,0.3);
          background: rgba(212,175,55,0.08);
          font-size: 13px;
          font-weight: 500;
          color: #D4AF37;
        }

        .dashboard-preview {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
        }
        .preview-bar {
          background: rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 12px 20px;
          display: flex; align-items: center; gap: 8px;
        }
        .dot { width: 10px; height: 10px; border-radius: 50%; }

        .scroll-indicator {
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>

      <div className="grain" />

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(9,9,14,0.85)", backdropFilter: "blur(20px)",
        padding: "0 24px", height: "68px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: "100%"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #D4AF37, #c9a634)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Building2 size={20} color="black" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Unit<span className="gold">Sync</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden md:flex">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it works</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#testimonials" className="nav-link">Reviews</a>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/auth/signin" style={{
            color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 500,
            padding: "8px 16px", transition: "color 0.2s"
          }}>
            Sign in
          </Link>
          <Link href="/auth/signup" className="btn-gold" style={{
            padding: "9px 20px", borderRadius: 10, fontSize: 14,
            display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none"
          }}>
            Get started free
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="mesh" style={{ paddingTop: 140, paddingBottom: 100, position: "relative" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>

          <div className="fade-up" style={{ marginBottom: 24 }}>
            <span className="pill">
              <Star size={12} fill="#D4AF37" />
              Trusted by 10,000+ landlords across Africa
            </span>
          </div>

          <h1 className="hero-display fade-up delay-1" style={{ fontSize: "clamp(44px, 7vw, 84px)", marginBottom: 24, letterSpacing: "-0.02em" }}>
            Property management<br />
            <span className="gold">done right.</span>
          </h1>

          <p className="fade-up delay-2" style={{
            fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.5)",
            maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7, fontWeight: 400
          }}>
            From rent collection to maintenance requests — UnitSync gives landlords and tenants one powerful platform to manage everything.
          </p>

          <div className="fade-up delay-3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/signup" className="btn-gold" style={{
              padding: "14px 28px", borderRadius: 12, fontSize: 15,
              display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none"
            }}>
              Start free — no credit card
              <ArrowRight size={16} />
            </Link>
            <a href="#how-it-works" style={{
              padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 500,
              border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)",
              display: "inline-flex", alignItems: "center", gap: 8,
              transition: "all 0.2s", textDecoration: "none",
              background: "rgba(255,255,255,0.03)"
            }}>
              See how it works
            </a>
          </div>

          <div className="fade-up delay-4" style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 40, flexWrap: "wrap" }}>
            {["No setup fees", "14-day free trial", "Cancel anytime"].map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                <CheckCircle2 size={14} color="#D4AF37" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="fade-up delay-5" style={{ maxWidth: 900, margin: "64px auto 0", padding: "0 24px" }}>
          <div className="dashboard-preview">
            <div className="preview-bar">
              <div className="dot" style={{ background: "#FF5F56" }} />
              <div className="dot" style={{ background: "#FFBD2E" }} />
              <div className="dot" style={{ background: "#27C93F" }} />
              <span style={{ marginLeft: 8, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>UnitSync Dashboard</span>
            </div>
            <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { label: "Total Units", value: "48", sub: "+3 this month", icon: Building2, color: "#D4AF37" },
                { label: "Occupied", value: "45", sub: "93.7% occupancy", icon: Users, color: "#34D399" },
                { label: "Rent Due", value: "KES 2.3M", sub: "6 pending", icon: DollarSign, color: "#60A5FA" },
                { label: "Open Issues", value: "4", sub: "2 urgent", icon: Wrench, color: "#F87171" },
              ].map(({ label, value, sub, icon: Icon, color }) => (
                <div key={label} style={{
                  background: "rgba(255,255,255,0.04)", borderRadius: 12,
                  padding: 16, border: "1px solid rgba(255,255,255,0.06)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                    <Icon size={14} color={color} />
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{value}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{sub}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "0 24px 24px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.05)", height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BarChart3 size={32} color="rgba(212,175,55,0.3)" />
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.05)", height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={24} color="rgba(255,255,255,0.2)" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="line-gold" style={{ margin: "0 auto", maxWidth: 800 }} />

      {/* STATS */}
      <section style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { n: "10K+", l: "Properties Managed" },
            { n: "50K+", l: "Active Tenants" },
            { n: "KES 2B+", l: "Rent Collected" },
            { n: "99.9%", l: "Platform Uptime" },
          ].map(({ n, l }) => (
            <div key={l} className="stat-card">
              <div style={{ fontSize: 36, fontWeight: 700, color: "#D4AF37", marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>{n}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "80px 24px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="pill" style={{ marginBottom: 20, display: "inline-flex" }}>Everything you need</span>
          <h2 className="hero-display" style={{ fontSize: "clamp(32px, 5vw, 54px)", marginBottom: 16 }}>
            Built for landlords.<br /><span className="gold">Loved by tenants.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
            Every tool you need to run a professional rental business, in one place.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {[
            { icon: DollarSign, title: "Rent Collection", desc: "Track payments via M-Pesa, bank transfer, or cash. Auto-generate receipts and flag overdue accounts instantly." },
            { icon: Users, title: "Tenant Management", desc: "Onboard tenants with invite links, manage leases, store documents, and communicate from one dashboard." },
            { icon: Wrench, title: "Maintenance Requests", desc: "Tenants log issues from their portal. You track progress, assign contractors, and close tickets — all in-app." },
            { icon: BarChart3, title: "Financial Reports", desc: "Monthly rent ledgers, occupancy rates, income summaries. Export to PDF or share with your accountant." },
            { icon: Bell, title: "Smart Notifications", desc: "Automated rent reminders, overdue alerts, maintenance updates — sent to landlords and tenants automatically." },
            { icon: Shield, title: "Role-based Access", desc: "Separate portals for landlords and tenants. Each person sees exactly what they need — nothing more." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card-hover" style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, padding: 28
            }}>
              <div className="feature-icon">
                <Icon size={22} color="#D4AF37" />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "80px 24px", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 className="hero-display" style={{ fontSize: "clamp(30px, 4vw, 50px)", marginBottom: 16 }}>
              Up and running <span className="gold">in minutes</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}>Three steps to a fully managed property portfolio</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32 }}>
            {[
              { n: "01", title: "Create your account", desc: "Sign up as a landlord. Takes 2 minutes — no paperwork, no credit card." },
              { n: "02", title: "Add your properties", desc: "List your properties and units. Set rent amounts, upload photos, configure details." },
              { n: "03", title: "Invite your tenants", desc: "Send invite links to tenants. They create accounts, submit payments, and log maintenance from their own portal." },
            ].map(({ n, title, desc }) => (
              <div key={n} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{
                  minWidth: 52, height: 52, borderRadius: 14,
                  border: "1px solid rgba(212,175,55,0.3)",
                  background: "rgba(212,175,55,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#D4AF37", fontWeight: 700
                }}>{n}</div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DUAL VALUE PROP */}
      <section style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="md:grid-cols-2">
          {[
            {
              tag: "For Landlords",
              title: "Run your portfolio like a business",
              points: ["Track rent across all units in one view", "Get notified the moment a payment is missed", "Approve or reject maintenance requests", "Generate monthly income statements", "Manage tenant leases and documents"],
              cta: "Start as a landlord",
              href: "/auth/signup?role=landlord"
            },
            {
              tag: "For Tenants",
              title: "Your rental life, simplified",
              points: ["Pay rent and get instant receipts", "Submit maintenance requests with photos", "View your lease and payment history", "Get notified about important updates", "Chat directly with your landlord"],
              cta: "Join as a tenant",
              href: "/auth/signup?role=tenant"
            }
          ].map(({ tag, title, points, cta, href }) => (
            <div key={tag} style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20, padding: "36px"
            }}>
              <span className="pill" style={{ marginBottom: 20, display: "inline-flex" }}>{tag}</span>
              <h3 style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 700, marginBottom: 24, lineHeight: 1.3 }}>{title}</h3>
              <ul style={{ marginBottom: 32, display: "flex", flexDirection: "column", gap: 12 }}>
                {points.map(p => (
                  <li key={p} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
                    <CheckCircle2 size={16} color="#D4AF37" style={{ marginTop: 2, flexShrink: 0 }} />
                    {p}
                  </li>
                ))}
              </ul>
              <Link href={href} className="btn-gold" style={{
                padding: "12px 22px", borderRadius: 10, fontSize: 14,
                display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none"
              }}>
                {cta} <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{ padding: "80px 24px", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 className="hero-display" style={{ fontSize: "clamp(28px, 4vw, 46px)", marginBottom: 12 }}>
              What our users <span className="gold">say</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              { name: "James Kariuki", role: "Landlord, Nairobi", quote: "I used to chase rent via WhatsApp. Now everything is tracked automatically. UnitSync paid for itself in the first month." },
              { name: "Amina Hassan", role: "Property Manager, Mombasa", quote: "Managing 3 apartment blocks used to be a nightmare. UnitSync gives me a single dashboard for everything. Game changer." },
              { name: "Peter Ochieng", role: "Tenant, Kisumu", quote: "I can pay rent, check my balance, and report issues from my phone. My landlord responds faster now too!" },
            ].map(({ name, role, quote }) => (
              <div key={name} className="testimonial-card">
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#D4AF37" color="#D4AF37" />)}
                </div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 20 }}>"{quote}"</p>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 className="hero-display" style={{ fontSize: "clamp(30px, 4vw, 50px)", marginBottom: 16 }}>
            Simple, <span className="gold">transparent pricing</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}>Start free. Scale as you grow.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 900, margin: "0 auto" }}>
          {[
            { name: "Starter", price: "Free", period: "forever", features: ["Up to 5 units", "Tenant portal", "Rent tracking", "Maintenance requests", "Email support"], cta: "Get started free", featured: false, href: "/auth/signup" },
            { name: "Growth", price: "KES 2,500", period: "per month", features: ["Up to 50 units", "Everything in Starter", "Financial reports", "SMS notifications", "Priority support", "Data export"], cta: "Start 14-day trial", featured: true, href: "/auth/signup" },
            { name: "Enterprise", price: "Custom", period: "contact us", features: ["Unlimited units", "Everything in Growth", "White-label portal", "API access", "Dedicated manager", "Custom integrations"], cta: "Contact sales", featured: false, href: "/auth/signup" },
          ].map(({ name, price, period, features, cta, featured, href }) => (
            <div key={name} className={`pricing-card ${featured ? "featured" : ""}`}>
              {featured && (
                <div style={{ marginBottom: 16 }}>
                  <span className="pill" style={{ fontSize: 11 }}>Most popular</span>
                </div>
              )}
              <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>{name}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, marginBottom: 4 }}>{price}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>{period}</div>
              <ul style={{ marginBottom: 28, display: "flex", flexDirection: "column", gap: 10 }}>
                {features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                    <CheckCircle2 size={14} color="#D4AF37" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={href} className={featured ? "btn-gold" : ""} style={{
                display: "block", textAlign: "center",
                padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                textDecoration: "none",
                ...(featured ? {} : {
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.7)",
                  transition: "all 0.2s"
                })
              }}>
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: "0 24px 100px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))",
          border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: 24, padding: "60px 40px", textAlign: "center"
        }}>
          <h2 className="hero-display" style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: 16 }}>
            Ready to get started?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, marginBottom: 36, maxWidth: 440, margin: "0 auto 36px" }}>
            Join thousands of landlords using UnitSync to manage their properties professionally.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/signup" className="btn-gold" style={{
              padding: "14px 28px", borderRadius: 12, fontSize: 15,
              display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none"
            }}>
              Create free account
              <ArrowRight size={16} />
            </Link>
            <Link href="/auth/signin" style={{
              padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 500,
              border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)",
              display: "inline-flex", alignItems: "center", gap: 8,
              transition: "all 0.2s", textDecoration: "none",
              background: "rgba(255,255,255,0.03)"
            }}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "48px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Building2 size={20} color="#D4AF37" />
              <span style={{ fontWeight: 700 }}>Unit<span className="gold">Sync</span></span>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {["Privacy", "Terms", "Contact", "Support"].map(l => (
                <a key={l} href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.2s" }}>{l}</a>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 UnitSync. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}