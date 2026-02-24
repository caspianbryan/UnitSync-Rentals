"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SignInButton, useUser, UserButton } from "@clerk/nextjs";
import {
  Building2,
  Shield,
  TrendingUp,
  Users,
  FileCheck,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Lock,
  Zap,
  LogIn
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Home() {
  return <LuxuryLanding />;
}

/* ================================
   PREMIUM PROPERTY MANAGEMENT
================================ */

function LuxuryLanding() {


  const { user, isLoaded } = useUser();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] text-slate-900 dark:text-[#E6E6E6] transition-colors">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 border-b border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-[#0A0A0F]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-[#D4AF37]" />
            <span className="text-2xl font-bold tracking-tight">Unit<span className="text-[#D4AF37]">Sync</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-[#D4AF37] transition-colors">Features</a>
            <a href="#benefits" className="text-sm font-medium hover:text-[#D4AF37] transition-colors">Benefits</a>
            <a href="#pricing" className="text-sm font-medium hover:text-[#D4AF37] transition-colors">Pricing</a>
            <ThemeToggle />
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle className="md:hidden" />
            {isLoaded && !user && (
              <SignInButton mode="modal" forceRedirectUrl="/onboarding">
                <Button variant="ghost">Sign in</Button>
              </SignInButton>
            )}
          </div>
          {/* <HeaderAuth /> */}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 dark:from-[#1F1F27] dark:via-transparent dark:to-black/70" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative max-w-7xl mx-auto px-6"
        >
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-6 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-2 text-sm font-medium text-[#D4AF37]"
            >
              <Sparkles className="w-4 h-4" />
              Enterprise-grade property operations platform
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Property management
              <span className="block bg-gradient-to-r from-[#D4AF37] via-[#F4E5C3] to-[#D4AF37] bg-clip-text text-transparent">
                elevated to excellence
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-[#9CA3AF] max-w-3xl mx-auto mb-10 leading-relaxed">
              Transform your rental portfolio with intelligent automation, real-time insights,
              and seamless tenant management. Built for professionals who demand precision.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="rounded-full bg-[#D4AF37] text-black hover:bg-[#c9a634] px-8 h-14 text-base font-semibold shadow-lg shadow-[#D4AF37]/20"
                >
                  Start free trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </SignInButton>

              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 px-8 h-14 text-base font-semibold"
              >
                Watch demo
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-slate-600 dark:text-[#9CA3AF]">
              {["No credit card required", "14-day free trial", "Cancel anytime"].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Hero image/mockup placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-6xl mx-auto px-6 mt-16"
        >
          <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-100 to-blue-50 dark:from-[#1F1F27] dark:to-[#0A0A0F] p-2 shadow-2xl">
            <div className="aspect-video rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-blue-100/50 dark:from-[#D4AF37]/10 dark:to-transparent flex items-center justify-center">
              <BarChart3 className="w-24 h-24 text-[#D4AF37]/40 dark:text-[#D4AF37]/30" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* TRUST METRICS */}
      <section className="border-y border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-[#0A0A0F]/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Properties Managed" },
              { number: "50K+", label: "Active Tenants" },
              { number: "99.9%", label: "Uptime SLA" },
              { number: "$2B+", label: "Rent Processed" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-slate-600 dark:text-[#9CA3AF]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need to manage
              <span className="text-[#D4AF37]"> premium properties</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-[#9CA3AF]">
              Powerful features designed for portfolio managers, landlords, and property professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Bank-grade Security",
                description: "SOC 2 Type II certified with end-to-end encryption. Your data is protected with military-grade security protocols.",
              },
              {
                icon: TrendingUp,
                title: "Real-time Analytics",
                description: "Advanced dashboards with predictive insights. Track occupancy rates, revenue trends, and maintenance costs in real-time.",
              },
              {
                icon: Users,
                title: "Tenant Portal",
                description: "Self-service portal for rent payments, maintenance requests, and document access. Reduce operational overhead by 60%.",
              },
              {
                icon: FileCheck,
                title: "Automated Compliance",
                description: "Stay audit-ready with automated lease tracking, document management, and regulatory compliance monitoring.",
              },
              {
                icon: Smartphone,
                title: "Mobile Command Center",
                description: "Full-featured iOS and Android apps. Manage your entire portfolio from anywhere, anytime.",
              },
              {
                icon: Zap,
                title: "Smart Automation",
                description: "Automate rent collection, late fee calculation, lease renewals, and tenant communication workflows.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1F1F27]/50 hover:border-[#D4AF37]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#D4AF37]/10"
              >
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="benefits" className="py-24 md:py-32 bg-slate-100 dark:bg-[#0A0A0F]/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                Built for scale.
                <span className="block text-[#D4AF37]">Designed for growth.</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-[#9CA3AF] mb-8 leading-relaxed">
                Whether you manage 10 units or 10,000, UnitSync scales with your business.
                Our enterprise infrastructure handles unlimited properties, tenants, and transactions.
              </p>

              <div className="space-y-4">
                {[
                  "Multi-property dashboard with consolidated reporting",
                  "Role-based access control for teams and contractors",
                  "White-label tenant portals with your branding",
                  "API access for custom integrations and workflows",
                ].map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <SignInButton mode="modal">
                  <Button
                    size="lg"
                    className="rounded-full bg-[#D4AF37] text-black hover:bg-[#c9a634] px-8"
                  >
                    Get started today
                  </Button>
                </SignInButton>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-[#D4AF37]/10 via-blue-50/50 to-indigo-50/50 dark:from-[#D4AF37]/10 dark:via-transparent dark:to-transparent p-8 flex items-center justify-center">
                <Lock className="w-32 h-32 text-[#D4AF37]/40 dark:text-[#D4AF37]/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative p-12 rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 dark:from-[#1F1F27] dark:via-transparent dark:to-[#0A0A0F]"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Ready to transform your
              <span className="block text-[#D4AF37]">property management?</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-[#9CA3AF] mb-8 max-w-2xl mx-auto">
              Join thousands of property managers who trust UnitSync to streamline operations,
              increase revenue, and delight their tenants.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="rounded-full bg-[#D4AF37] text-black hover:bg-[#c9a634] px-8 h-14 text-base font-semibold"
                >
                  Start your free trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </SignInButton>

              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 px-8 h-14 text-base font-semibold"
              >
                Schedule demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-[#0A0A0F]/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-6 h-6 text-[#D4AF37]" />
                <span className="text-xl font-bold">UnitSync</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-[#9CA3AF]">
                Enterprise property management for modern landlords.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Security", "Integrations"],
              },
              {
                title: "Company",
                links: ["About", "Careers", "Blog", "Contact"],
              },
              {
                title: "Legal",
                links: ["Privacy", "Terms", "Compliance", "GDPR"],
              },
            ].map((column) => (
              <div key={column.title}>
                <h3 className="font-semibold mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-slate-600 dark:text-[#9CA3AF] hover:text-[#D4AF37] transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600 dark:text-[#9CA3AF]">
              © 2026 UnitSync. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Twitter", "LinkedIn", "GitHub"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-sm text-slate-600 dark:text-[#9CA3AF] hover:text-[#D4AF37] transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

