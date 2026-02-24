"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import {
  DollarSign, CheckCircle2, Clock, AlertCircle,
  Smartphone, Landmark, Banknote, Receipt,
  ChevronDown, ChevronUp, ArrowLeft, TrendingUp, X
} from "lucide-react";

const METHOD = {
  mpesa: { label: "M-Pesa", icon: Smartphone, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-950/40" },
  bank: { label: "Bank", icon: Landmark, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-950/40" },
  cash: { label: "Cash", icon: Banknote, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-950/40" },
};
const STATUS = {
  paid: { label: "Paid", dot: "bg-emerald-400", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", icon: CheckCircle2 },
  partial: { label: "Partial", dot: "bg-orange-400", text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", icon: Clock },
  unpaid: { label: "Due", dot: "bg-red-400", text: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", icon: AlertCircle },
  overdue: { label: "Overdue", dot: "bg-red-500", text: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", icon: AlertCircle },
};

function fmt(n) { return (n || 0).toLocaleString(); }
function getMonthLabel(month, short = false) {
  const [year, m] = month.split("-");
  return new Date(year, parseInt(m) - 1).toLocaleString("default", { month: short ? "short" : "long", year: "numeric" });
}

export default function TenantPaymentsPage() {
  const { user } = useUser();
  const [expandedId, setExpandedId] = useState(null);

  const tenant = useQuery(
    api.tenants.getTenantByEmail,
    user?.emailAddresses?.[0]?.emailAddress ? { email: user.emailAddresses[0].emailAddress } : "skip"
  );
  const history = useQuery(
    api.payments.getTenantPaymentHistory,
    tenant?._id ? { tenantId: tenant._id } : "skip"
  );

  if (!tenant || !history) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#0D0D14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading payments…</p>
        </div>
      </div>
    );
  }

  const totalPaid = history.reduce((s, e) => s + e.amountPaid, 0);
  const totalDue = history.reduce((s, e) => s + e.amountDue, 0);
  const paidMonths = history.filter(e => e.status === "paid").length;
  const pendingAmt = history.reduce((s, e) => s + Math.max(0, e.amountDue - e.amountPaid), 0);
  const current = history[0];
  const pCfg = current ? (STATUS[current.status] || STATUS.unpaid) : STATUS.unpaid;
  const PIcon = pCfg.icon;
  const pct = current && current.amountDue > 0
    ? Math.min(100, Math.round((current.amountPaid / current.amountDue) * 100)) : 0;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0D0D14]">

      {/* ── HERO ── */}
      <div className="relative bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] pb-16 pt-6 px-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Back nav */}
        <Link href="/tenant" className="inline-flex items-center gap-2 text-blue-300/70 text-sm mb-6 hover:text-blue-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-blue-300/70 text-xs font-medium uppercase tracking-wide mb-1">Payment Overview</p>
            <h1 className="text-white text-2xl font-bold">My Payments</h1>
          </div>
          <Link href="/tenant/payments/submit">
            <div className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20">
              <DollarSign className="w-4 h-4" /> Submit Payment
            </div>
          </Link>
        </div>

        {/* Current month card */}
        {current && (
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-blue-200/70 text-xs mb-1">{getMonthLabel(current.month)}</p>
                <p className="text-white text-3xl font-bold">KES {fmt(current.amountDue)}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${pCfg.bg} border ${pCfg.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`} />
                <span className={`text-xs font-bold ${pCfg.text}`}>{pCfg.label}</span>
              </div>
            </div>

            {/* 3-col breakdown */}
            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              {[
                { label: "Rent", value: `KES ${fmt(current.amountDue)}`, color: "text-blue-200" },
                { label: "Paid", value: `KES ${fmt(current.amountPaid)}`, color: "text-emerald-300" },
                {
                  label: "Balance", value: `KES ${fmt(Math.max(0, current.amountDue - current.amountPaid))}`,
                  color: current.status === "paid" ? "text-emerald-300" : "text-red-300"
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/10 rounded-xl py-2.5 px-1">
                  <p className={`text-sm font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-blue-200/60 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${current.status === "paid" ? "bg-emerald-400" :
                    current.status === "partial" ? "bg-orange-400" : "bg-red-400"
                  }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[11px] text-blue-200/60 text-right">{pct}% paid</p>
          </div>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div className="relative -mt-8 px-4 space-y-4 pb-28">

        {/* Summary stat tiles */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total Paid", value: `KES ${fmt(totalPaid)}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { label: "Outstanding", value: `KES ${fmt(pendingAmt)}`, icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
            { label: "Paid Months", value: paidMonths, icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
            { label: "Total Due", value: `KES ${fmt(totalDue)}`, icon: Receipt, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-800/50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 truncate">{label}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* History list */}
        <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm">Payment History</h2>
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center">
              <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No payment records yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-white/5">
              {history.map(entry => {
                const s = STATUS[entry.status] || STATUS.unpaid;
                const SI = s.icon;
                const exp = expandedId === entry._id;
                const bal = entry.amountDue - entry.amountPaid;

                return (
                  <div key={entry._id}>
                    {/* Row */}
                    <button
                      onClick={() => setExpandedId(exp ? null : entry._id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                    >
                      <div className={`w-9 h-9 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center flex-shrink-0`}>
                        <SI className={`w-4 h-4 ${s.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {getMonthLabel(entry.month, true)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {entry.payments?.length || 0} payment{entry.payments?.length !== 1 ? "s" : ""}
                          {bal > 0 && ` · KES ${fmt(bal)} left`}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 mr-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          KES {fmt(entry.amountPaid)}
                        </p>
                        <p className={`text-xs font-semibold ${s.text}`}>{s.label}</p>
                      </div>
                      {exp
                        ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                    </button>

                    {/* Expanded payments */}
                    {exp && (
                      <div className="bg-slate-50 dark:bg-black/10 px-4 pb-3 pt-1 space-y-2">
                        {entry.payments?.length === 0 ? (
                          <p className="text-xs text-slate-400 py-2 text-center">No payments recorded</p>
                        ) : entry.payments?.map(p => {
                          const M = METHOD[p.method] || METHOD.cash;
                          const MI = M.icon;
                          return (
                            <div key={p._id} className="flex items-center gap-3 bg-white dark:bg-[#1C1C28] rounded-xl p-3">
                              <div className={`w-8 h-8 rounded-lg ${M.bg} flex items-center justify-center flex-shrink-0`}>
                                <MI className={`w-3.5 h-3.5 ${M.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white">{M.label}</p>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                  {p.referenceNumber && <span className="font-mono">{p.referenceNumber}</span>}
                                  {p.referenceNumber && <span>·</span>}
                                  <span>{new Date(p.paidDate).toLocaleDateString()}</span>
                                </div>
                                {p.notes && <p className="text-[10px] text-slate-400 mt-0.5">{p.notes}</p>}
                              </div>
                              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                                KES {fmt(p.amount)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <BottomNav active="pay" />
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