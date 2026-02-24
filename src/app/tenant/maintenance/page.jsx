"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import {
  Wrench, Plus, AlertCircle, Clock,
  CheckCircle2, Calendar, MessageSquare, ArrowLeft, Archive
} from "lucide-react";

const STATUS_CFG = {
  open: { label: "Open", icon: AlertCircle, dot: "bg-red-400", text: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800" },
  in_progress: { label: "In Progress", icon: Clock, dot: "bg-orange-400", text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800" },
  resolved: { label: "Resolved", icon: CheckCircle2, dot: "bg-emerald-400", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  archived: { label: "Archived", icon: Archive, dot: "bg-slate-400", text: "text-slate-500 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-800/50", border: "border-slate-200 dark:border-white/10" },
};

export default function TenantMaintenancePage() {
  const { user } = useUser();

  const tenant = useQuery(
    api.tenants.getTenantByEmail,
    user?.emailAddresses?.[0]?.emailAddress ? { email: user.emailAddresses[0].emailAddress } : "skip"
  );
  const requests = useQuery(
    api.maintenance.getRequestsForTenant,
    tenant?._id ? { tenantId: tenant._id } : "skip"
  );

  if (!tenant || !requests) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#0D0D14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading requests…</p>
        </div>
      </div>
    );
  }

  const openCount = requests.filter(r => r.status === "open").length;
  const inProgCount = requests.filter(r => r.status === "in_progress").length;
  const resolvedCount = requests.filter(r => r.status === "resolved").length;
  const activeRequests = requests.filter(r => r.status !== "archived");

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0D0D14]">

      {/* ── HERO ── */}
      <div className="relative bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] pb-16 pt-6 px-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <Link href="/tenant" className="inline-flex items-center gap-2 text-blue-300/70 text-sm mb-6 hover:text-blue-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-blue-300/70 text-xs font-medium uppercase tracking-wide mb-1">Home Repairs</p>
            <h1 className="text-white text-2xl font-bold">Maintenance</h1>
          </div>
          {tenant.unitId && (
            <Link href="/tenant/maintenance/new">
              <div className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors">
                <Plus className="w-4 h-4" /> Report
              </div>
            </Link>
          )}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Total", value: requests.length, color: "text-blue-200" },
            { label: "Open", value: openCount, color: openCount > 0 ? "text-red-300" : "text-slate-300" },
            { label: "In Progress", value: inProgCount, color: inProgCount > 0 ? "text-orange-300" : "text-slate-300" },
            { label: "Resolved", value: resolvedCount, color: "text-emerald-300" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl py-2.5 text-center">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-blue-200/60 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="relative -mt-8 px-4 pb-28 space-y-4">

        {/* No requests empty state */}
        {activeRequests.length === 0 ? (
          <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-sm py-14 text-center px-6">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Requests Yet</h2>
            <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">
              Report home issues and your landlord will be notified immediately.
            </p>
            {tenant.unitId && (
              <Link href="/tenant/maintenance/new">
                <div className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors">
                  <Plus className="w-4 h-4" /> Make First Request
                </div>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Summary card - shows status breakdown */}
            <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      Your Requests
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {requests.length} total
                  </span>
                </div>

                {/* Status breakdown chips */}
                <div className="flex gap-2">
                  {openCount > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-xs font-bold text-red-600 dark:text-red-400">
                        {openCount} Open
                      </span>
                    </div>
                  )}
                  {inProgCount > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                      <Clock className="w-3 h-3 text-orange-500" />
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                        {inProgCount} Working
                      </span>
                    </div>
                  )}
                  {resolvedCount > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {resolvedCount} Done
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Request cards */}
            {requests.map(req => {
              const cfg = STATUS_CFG[req.status] || STATUS_CFG.open;
              const GIcon = cfg.icon;
              return (
                <Link
                  key={req._id}
                  href={`/dashboard/maintenance/${req._id}`}
                  className="block bg-white dark:bg-[#1C1C28] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                >
                  {/* Status bar on top */}
                  <div className={`h-1 ${cfg.bg}`} />

                  <div className="p-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <GIcon className={`w-4 h-4 ${cfg.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5 line-clamp-1">
                            {req.title}
                          </h3>
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            <span className="text-[10px] font-bold uppercase">{cfg.label}</span>
                          </div>
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 pl-10">
                      {req.description}
                    </p>

                    {/* Footer meta */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pl-10">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(req._creationTime).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400 font-medium">
                        <MessageSquare className="w-3 h-3" />
                        View chat
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav active="fix" />
    </div>
  );
}

function BottomNav({ active }) {
  const items = [
    { key: "home", label: "Home", href: "/tenant", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { key: "pay", label: "Pay", href: "/tenant/payments", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { key: "fix", label: "Repairs", href: "/tenant/maintenance", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
    { key: "me", label: "Profile", href: "/tenant/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#1C1C28] border-t border-slate-200 dark:border-white/10">
      <div className="flex items-center justify-around py-2 px-2">
        {items.map(({ key, label, href, icon }) => {
          const isActive = active === key;
          return (
            <Link key={key} href={href} className="flex flex-col items-center gap-0.5 py-1 px-3 relative">
              <svg className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
              <span className={`text-[10px] font-semibold ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>{label}</span>
              {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}