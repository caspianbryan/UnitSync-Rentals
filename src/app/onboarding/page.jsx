"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"; // Added useEffect
import { Building2, Home, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [isSelecting, setIsSelecting] = useState(false);

  const dbUser = useQuery(
    api.users.getByClerkId,
    user ? { clerkUserId: user.id } : "skip"
  );

  const completeOnboarding = useMutation(api.users.completeOnboarding);

  // Handle redirects in useEffect to avoid rendering issues
  useEffect(() => {
    if (!dbUser) return;

    if (dbUser.isAdmin) {
      router.push("/dashboard");
    } else if (dbUser.isTenant) {
      router.push("/tenant");
    }
  }, [dbUser, router]);

  // Show loading state
  if (!user || !dbUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render form if user is already assigned a role
  if (dbUser.isAdmin || dbUser.isTenant) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  const chooseRole = async (role) => {
    setIsSelecting(true);
    try {
      await completeOnboarding({
        userId: dbUser._id,
        role
      });

      toast.success(`Welcome! Setting up your ${role} dashboard...`);

      // Small delay for toast to show
      setTimeout(() => {
        router.push(role === "landlord" ? "/dashboard" : "/tenant");
      }, 500);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete setup. Please try again.");
      setIsSelecting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] flex items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <Building2 className="w-10 h-10 text-emerald-600" />
            <span className="text-3xl font-bold">
              Unit<span className="text-emerald-600">Sync</span>
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome to UnitSync! 👋
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Choose how you'll be using the platform to get started
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RoleCard
            icon={Building2}
            title="Landlord / Property Manager"
            description="Manage properties, tenants, units, maintenance requests, and rent collection"
            features={[
              "Manage multiple properties",
              "Track tenant information",
              "Handle maintenance requests",
              "Monitor rent payments",
              "Generate financial reports"
            ]}
            buttonText="Continue as Landlord"
            onClick={() => chooseRole("landlord")}
            disabled={isSelecting}
            color="emerald"
          />

          <RoleCard
            icon={Home}
            title="Tenant"
            description="Access your rental information, submit maintenance requests, and manage your lease"
            features={[
              "View your unit details",
              "Submit maintenance requests",
              "Track request status",
              "View lease information",
              "Update contact information"
            ]}
            buttonText="Continue as Tenant"
            onClick={() => chooseRole("tenant")}
            disabled={isSelecting}
            color="blue"
          />
        </div>

        {/* Info Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You can always contact support to change your role later
          </p>
        </div>
      </div>
    </main>
  );
}

function RoleCard({ icon: Icon, title, description, features, buttonText, onClick, disabled, color }) {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: 'text-emerald-600 dark:text-emerald-400',
      button: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700',
      hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-600'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700',
      hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`group relative rounded-2xl border-2 ${classes.border} bg-white dark:bg-[#1F1F27] p-8 transition-all duration-300 hover:shadow-2xl ${classes.hoverBorder} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      {/* Icon Header */}
      <div className={`w-16 h-16 rounded-2xl ${classes.bg} flex items-center justify-center mb-6`}>
        <Icon className={`w-8 h-8 ${classes.icon}`} />
      </div>

      {/* Title & Description */}
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
        {title}
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
        {description}
      </p>

      {/* Features List */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle2 className={`w-5 h-5 ${classes.icon} flex-shrink-0 mt-0.5`} />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* Action Button */}
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full ${classes.button} text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${disabled ? 'cursor-not-allowed' : 'hover:shadow-xl'}`}
      >
        {disabled ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Setting up...
          </>
        ) : (
          <>
            {buttonText}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </>
        )}
      </button>
    </div>
  );
}