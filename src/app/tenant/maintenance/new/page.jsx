"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Wrench, ArrowLeft, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { value: "plumbing", label: "🚿 Plumbing", desc: "Leaks, drainage, pipes" },
  { value: "electrical", label: "⚡ Electrical", desc: "Wiring, outlets, lights" },
  { value: "hvac", label: "❄️ AC / Heating", desc: "Temperature control" },
  { value: "appliance", label: "🏠 Appliances", desc: "Fridge, stove, washer" },
  { value: "structural", label: "🧱 Structural", desc: "Walls, floors, ceilings" },
  { value: "pest", label: "🐛 Pest Control", desc: "Insects, rodents" },
  { value: "other", label: "🔧 Other", desc: "Something else" },
];

export default function NewMaintenanceRequest() {
  const { user } = useUser();
  const router = useRouter();

  const tenant = useQuery(
    api.tenants.getTenantByEmail,
    user?.emailAddresses?.[0]?.emailAddress ? { email: user.emailAddresses[0].emailAddress } : "skip"
  );
  const createRequest = useMutation(api.maintenance.createRequest);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!tenant) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#0D0D14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (!tenant.unitId) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#0D0D14] flex items-center justify-center px-5">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Unit Assigned</h2>
          <p className="text-sm text-slate-400 mb-6">You need to be assigned to a unit first.</p>
          <Link href="/tenant">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold">
              Back to Dashboard
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#0D0D14] flex items-center justify-center px-5">
        <div className="text-center max-w-xs">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Sent!</h2>
          <p className="text-sm text-slate-400 mb-6">Your landlord has been notified and will respond shortly.</p>
          <div className="flex flex-col gap-2">
            <Link href="/tenant/maintenance">
              <div className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl px-5 py-3 text-sm font-semibold">
                View My Requests
              </div>
            </Link>
            <Link href="/tenant">
              <div className="w-full flex items-center justify-center gap-2 bg-white dark:bg-[#1C1C28] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl px-5 py-3 text-sm font-semibold">
                Back to Dashboard
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in both fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await createRequest({
        tenantId: tenant._id,
        unitId: tenant.unitId,
        title: title.trim(),
        description: description.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit request");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0D0D14]">

      {/* ── HERO ── */}
      <div className="relative bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] pb-16 pt-6 px-5 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <Link href="/tenant/maintenance" className="inline-flex items-center gap-2 text-blue-300/70 text-sm mb-6 hover:text-blue-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Maintenance
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-orange-300" />
          </div>
          <div>
            <p className="text-blue-300/70 text-xs font-medium uppercase tracking-wide">New Request</p>
            <h1 className="text-white text-xl font-bold">Report an Issue</h1>
          </div>
        </div>
      </div>

      {/* ── FORM ── */}
      <div className="relative -mt-8 px-4 pb-12">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title field */}
          <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-sm p-5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 block">
              Issue Title *
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Leaking kitchen tap"
              disabled={isSubmitting}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
            <p className="text-xs text-slate-400 mt-2">Keep it short and descriptive</p>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-sm p-5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 block">
              Description *
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the problem in detail — where it is, how long it's been happening, and anything else that might help..."
              disabled={isSubmitting}
              rows={5}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* What happens next */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">What happens next?</p>
            </div>
            <ul className="space-y-1.5">
              {[
                "Your landlord gets notified immediately",
                "You can track progress in real-time",
                "Chat updates appear in the request thread",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-blue-700 dark:text-blue-400">
                  <span className="w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold flex-shrink-0 mt-0.5 text-[10px]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl h-12 text-sm font-semibold transition-all ${isSubmitting || !title.trim() || !description.trim()
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Wrench className="w-4 h-4" />
                  Submit Request
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="px-5 h-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1C1C28] text-slate-700 dark:text-slate-300 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}