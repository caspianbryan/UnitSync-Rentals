"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import {
  Wrench, Calendar, Building2, DollarSign,
  AlertCircle, CheckCircle2, Phone, Mail, MapPin,
  Plus, User, CreditCard, Clock, ChevronRight,
  X, Home, ArrowUpRight, Smartphone, Landmark,
  Banknote, FileText, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── Helpers ────────────────────────────────────────────────────────────── */
function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
function getMonthLabel(month, short = false) {
  const [year, m] = month.split("-");
  return new Date(year, parseInt(m) - 1).toLocaleString("default", {
    month: short ? "short" : "long",
    year: "numeric",
  });
}
function fmt(n) { return (n || 0).toLocaleString(); }

const STATUS = {
  paid: { label: "Paid", dot: "bg-emerald-400", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", icon: CheckCircle2 },
  partial: { label: "Partial", dot: "bg-orange-400", text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", icon: Clock },
  unpaid: { label: "Due", dot: "bg-red-400", text: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", icon: AlertCircle },
  overdue: { label: "Overdue", dot: "bg-red-500", text: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", icon: AlertCircle },
};

const METHOD = {
  mpesa: { label: "M-Pesa", icon: Smartphone, color: "text-emerald-600 dark:text-emerald-400" },
  bank: { label: "Bank", icon: Landmark, color: "text-blue-600 dark:text-blue-400" },
  cash: { label: "Cash", icon: Banknote, color: "text-orange-600 dark:text-orange-400" },
};

/* ── Modal Sheet (Top Positioned) ────────────────────────────────────────── */
function BottomSheet({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative bg-white dark:bg-[#16161E] rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="overflow-y-auto flex-1 px-5 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────── */
export default function TenantDashboardPage() {
  const { user } = useUser();
  const thisMonth = currentMonth();

  const [sheet, setSheet] = useState(null); // "rent" | "maintenance" | "home" | "profile"

  const convexUser = useQuery(api.users.getByClerkId, user ? { clerkUserId: user.id } : "skip");
  const tenant = useQuery(
    api.tenants.getTenantByEmail,
    user?.emailAddresses?.[0]?.emailAddress ? { email: user.emailAddresses[0].emailAddress } : "skip"
  );
  const data = useQuery(api.tenants.getTenantDashboard, tenant?._id ? { tenantId: tenant._id } : "skip");
  const paymentHistory = useQuery(api.payments.getTenantPaymentHistory, tenant?._id ? { tenantId: tenant._id } : "skip");

  const mySubmissions = useQuery(
    api.paymentSubmissions.getTenantSubmissions,
    tenant?._id ? { tenantId: tenant._id } : "skip"

  );


  /* guards */
  // if (!convexUser) return <Loader label="Loading…" />;
  // if (!convexUser.isTenant) return <ErrorState title="Access Denied" body="You don't have tenant access." />;
  // if (!tenant) return <ErrorState title="Profile Not Found" body={`Your landlord needs to register: ${user?.emailAddresses?.[0]?.emailAddress}`} />;
  // if (!data) return <Loader label="Loading dashboard…" />;

  /* loading states */
if (convexUser === undefined) {
  return <Loader label="Loading user…" />;
}

if (tenant === undefined) {
  return <Loader label="Loading profile…" />;
}

if (data === undefined) {
  return <Loader label="Loading dashboard…" />;
}

/* access control */
if (!convexUser) {
  return <ErrorState title="User Not Found" body="Contact support." />;
}

if (!convexUser.isTenant) {
  return <ErrorState title="Access Denied" body="You don't have tenant access." />;
}

if (!tenant) {
  return (
    <ErrorState
      title="Profile Not Found"
      body={`Your landlord needs to register: ${user?.emailAddresses?.[0]?.emailAddress}`}
    />
  );
}

  const { tenant: T, unit, property, maintenanceCount, openIssues } = data;

  const currentEntry = paymentHistory?.find(e => e.month === thisMonth);
  const totalPaid = paymentHistory?.reduce((s, e) => s + e.amountPaid, 0) || 0;
  const paidMonths = paymentHistory?.filter(e => e.status === "paid").length || 0;
  const status = currentEntry?.status || "unpaid";
  const pCfg = STATUS[status] || STATUS.unpaid;
  const balance = currentEntry ? currentEntry.amountDue - currentEntry.amountPaid : unit?.rentAmount || 0;
  const pct = currentEntry ? Math.min(100, Math.round((currentEntry.amountPaid / currentEntry.amountDue) * 100)) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
  const firstName = T.fullName.split(" ")[0];
  const PIcon = pCfg.icon;

  const currentMonthSubmission = mySubmissions?.find(s => s.month === thisMonth);

  return (
    <>
      <div className="min-h-screen bg-slate-100 dark:bg-[#0D0D14]">

        {/* ── TOP HERO ── banking-style dark gradient header ───────────────── */}
        <div className="relative bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] pb-16 pt-6 px-5 overflow-hidden">
          {/* Soft glow orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          {/* Top bar */}
          <div className="relative flex items-center justify-between mb-6">
            <div>
              <p className="text-blue-300/70 text-xs font-medium tracking-wide uppercase">
                Good {greeting}
              </p>
              <h1 className="text-white text-xl font-bold mt-0.5">{firstName} 👋</h1>
            </div>
            <div className="flex items-center gap-2">
              {openIssues > 0 && (
                <button
                  onClick={() => setSheet("maintenance")}
                  className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <Bell className="w-4 h-4 text-white" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                    {openIssues}
                  </span>
                </button>
              )}
              <button
                onClick={() => setSheet("profile")}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm"
              >
                {T.fullName.charAt(0).toUpperCase()}
              </button>
            </div>
          </div>

          {/* Property badge */}
          {property && unit && (
            <div className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-5">
              <MapPin className="w-3 h-3 text-blue-300" />
              <span className="text-xs text-blue-200 font-medium">
                {property.name} · Unit {unit.unitNumber}
              </span>
            </div>
          )}

          {/* ── MAIN BALANCE CARD ── */}
          <div className="relative bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-blue-200/70 text-xs font-medium mb-1">
                  {getMonthLabel(thisMonth)} Rent
                </p>
                <p className="text-white text-4xl font-bold tracking-tight">
                  KES {fmt(unit?.rentAmount)}
                </p>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${pCfg.bg} border ${pCfg.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`} />
                <span className={`text-xs font-bold ${pCfg.text}`}>{pCfg.label}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-blue-200/60 mb-1.5">
                <span>Paid: KES {fmt(currentEntry?.amountPaid || 0)}</span>
                <span>{pct}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${status === "paid" ? "bg-emerald-400" :
                      status === "partial" ? "bg-orange-400" : "bg-red-400"
                    }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {balance > 0 && status !== "paid" && (
              <p className="text-xs text-red-300 font-medium">
                KES {fmt(balance)} remaining
              </p>
            )}
            {status === "paid" && (
              <p className="text-xs text-emerald-300 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Fully paid this month!
              </p>
            )}
          </div>
        </div>

        {/* ── CONTENT — overlaps hero ──────────────────────────────────────── */}
        <div className="relative -mt-8 px-4 space-y-4 pb-28">

          {/* ── QUICK ACTION PILLS ── */}
          <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-lg shadow-black/10 p-4">
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Pay Rent", icon: CreditCard, color: "bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400", href: "/tenant/payments" },
                { label: "Repairs", icon: Wrench, color: "bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400", onClick: () => setSheet("maintenance") },
                { label: "My Home", icon: Home, color: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400", onClick: () => setSheet("home") },
                { label: "Profile", icon: User, color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300", onClick: () => setSheet("profile") },
              ].map(({ label, icon: Icon, color, href, onClick }) => (
                href ? (
                  <Link key={label} href={href} className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 text-center leading-tight">{label}</span>
                  </Link>
                ) : (
                  <button key={label} onClick={onClick} className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 text-center leading-tight">{label}</span>
                  </button>
                )
              ))}
            </div>
          </div>

          {/* ── PAYMENT HISTORY STRIP ── */}
          <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-lg shadow-black/10 overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100 dark:border-white/5">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-500" />
                Payment History
              </h2>

              <Link href="/tenant/payments">
                <span className="text-xs font-semibold text-purple-500 flex items-center gap-0.5">
                  See all <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </div>

            {/* All-time stats row */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-white/5 border-b border-slate-100 dark:border-white/5">
              {[
                { label: "Total Paid", value: `KES ${fmt(totalPaid)}`, color: "text-emerald-600 dark:text-emerald-400" },
                { label: "Paid Months", value: paidMonths, color: "text-blue-600 dark:text-blue-400" },
                { label: "Monthly", value: `KES ${fmt(unit?.rentAmount)}`, color: "text-slate-900 dark:text-white" },
              ].map(({ label, value, color }) => (
                <div key={label} className="py-3 px-3 text-center">
                  <p className={`text-sm font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Recent months */}
            {paymentHistory && paymentHistory.length > 0 ? (
              <div className="divide-y divide-slate-50 dark:divide-white/5">
                {currentMonthSubmission?.status === "pending" && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-100 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                    <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                      Payment proof under review
                    </p>
                  </div>
                )}

                {currentMonthSubmission?.status === "rejected" && (
                  <div className="mt-3 p-3 rounded-xl bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-2">
                      <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                        Payment proof rejected
                      </p>
                    </div>
                    {currentMonthSubmission.rejectionReason && (
                      <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                        {currentMonthSubmission.rejectionReason}
                      </p>
                    )}
                    <Link href="/tenant/payments/submit">
                      <button className="text-xs text-red-700 dark:text-red-300 font-semibold hover:underline">
                        Resubmit payment →
                      </button>
                    </Link>
                  </div>
                )}
                {paymentHistory.slice(0, 4).map(entry => {
                  const s = STATUS[entry.status] || STATUS.unpaid;
                  const SIcon = s.icon;
                  const firstPayment = entry.payments?.[0];
                  const MIcon = firstPayment ? (METHOD[firstPayment.method]?.icon || Banknote) : Banknote;
                  return (
                    <div key={entry._id} className="flex items-center gap-3 px-4 py-3">
                      <div className={`w-9 h-9 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center flex-shrink-0`}>
                        <SIcon className={`w-4 h-4 ${s.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {getMonthLabel(entry.month, true)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {entry.payments?.length || 0} payment{entry.payments?.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          KES {fmt(entry.amountPaid)}
                        </p>
                        <p className={`text-xs font-semibold ${s.text}`}>{s.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No payment history yet</p>
              </div>
            )}
          </div>

          {/* ── MAINTENANCE STRIP ── */}
          <button
            onClick={() => setSheet("maintenance")}
            className="w-full bg-white dark:bg-[#1C1C28] rounded-2xl shadow-lg shadow-black/10 overflow-hidden text-left"
          >
            <div className="flex items-center gap-4 p-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${openIssues > 0
                  ? "bg-orange-100 dark:bg-orange-950/40"
                  : "bg-emerald-100 dark:bg-emerald-950/40"
                }`}>
                <Wrench className={`w-5 h-5 ${openIssues > 0 ? "text-orange-500" : "text-emerald-500"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Maintenance</p>
                  {openIssues > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-[10px] font-bold">
                      {openIssues} open
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {openIssues > 0 ? `${openIssues} of ${maintenanceCount} requests need attention` : `${maintenanceCount} requests — all resolved`}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-white/5 border-t border-slate-100 dark:border-white/5">
              {[
                { label: "Open", value: openIssues, color: openIssues > 0 ? "text-red-500" : "text-slate-400" },
                { label: "Total", value: maintenanceCount, color: "text-slate-900 dark:text-white" },
                { label: "Resolved", value: Math.max(0, maintenanceCount - openIssues), color: "text-emerald-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="py-2.5 text-center">
                  <p className={`text-base font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </button>

          {/* ── LEASE CARD ── compact */}
          {T.leaseStart && T.leaseEnd && (
            <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-lg shadow-black/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-blue-500" />
                <h2 className="font-bold text-slate-900 dark:text-white text-sm">Lease</h2>
                <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Active</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Start</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {new Date(T.leaseStart).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">End</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {new Date(T.leaseEnd).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── BOTTOM NAV ──────────────────────────────────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#1C1C28] border-t border-slate-200 dark:border-white/10 px-4 pb-safe">
          <div className="flex items-center justify-around py-2">
            {[
              { label: "Home", icon: Home, active: true, href: "/tenant" },
              { label: "Pay", icon: CreditCard, active: false, href: "/tenant/payments" },
              { label: "Repairs", icon: Wrench, active: false, href: "/tenant/maintenance", badge: openIssues },
              { label: "Profile", icon: User, active: false, href: "/tenant/profile" },
            ].map(({ label, icon: Icon, active, href, badge }) => (
              <Link key={label} href={href} className="flex flex-col items-center gap-0.5 py-1 px-3 relative">
                {badge > 0 && (
                  <span className="absolute -top-0.5 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                    {badge}
                  </span>
                )}
                <Icon className={`w-5 h-5 ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                <span className={`text-[10px] font-semibold ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}>
                  {label}
                </span>
                {active && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          BOTTOM SHEETS
      ════════════════════════════════════════════════════════════════════ */}

      {/* ── MY HOME SHEET ── */}
      <BottomSheet open={sheet === "home"} onClose={() => setSheet(null)}>
        <div className="flex items-center justify-between py-4 mb-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-500" /> My Home
          </h2>
          <button onClick={() => setSheet(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500 dark:text-slate-300" />
          </button>
        </div>

        {unit && property ? (
          <div className="space-y-4">
            {/* Big property banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <Building2 className="w-8 h-8 text-white/70 mb-3" />
              <p className="text-2xl font-bold mb-1">{property.name}</p>
              <p className="text-blue-200 text-sm">Unit {unit.unitNumber}</p>
              {property.location && (
                <div className="flex items-center gap-1.5 mt-3 text-blue-200 text-xs">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{property.location}</span>
                </div>
              )}
            </div>

            {/* Key details */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Monthly Rent", value: `KES ${fmt(unit.rentAmount)}`, highlight: true },
                { label: "Unit Number", value: unit.unitNumber },
                { label: "Status", value: "Occupied" },
                { label: "Lease Active", value: T.leaseStart ? "Yes" : "No" },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5">
                  <p className="text-xs text-slate-400 mb-1">{label}</p>
                  <p className={`text-sm font-bold ${highlight ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick actions from home */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href="/tenant/payments" onClick={() => setSheet(null)}>
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-center">
                  <CreditCard className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-purple-700 dark:text-purple-300">Pay Rent</p>
                  <p className="text-xs text-purple-500/70 mt-0.5">
                    {status === "paid" ? "Paid ✓" : `KES ${fmt(balance)} due`}
                  </p>
                </div>
              </Link>
              <button onClick={() => setSheet("maintenance")} className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-center">
                <Wrench className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-orange-700 dark:text-orange-300">Maintenance</p>
                <p className="text-xs text-orange-500/70 mt-0.5">{openIssues} open</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Home className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">No unit assigned yet</p>
          </div>
        )}
      </BottomSheet>

      {/* ── MAINTENANCE SHEET ── */}
      <BottomSheet open={sheet === "maintenance"} onClose={() => setSheet(null)}>
        <div className="flex items-center justify-between py-4 mb-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-500" /> Maintenance
          </h2>
          <button onClick={() => setSheet(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500 dark:text-slate-300" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Open", value: openIssues, bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-500", border: "border-red-100 dark:border-red-900" },
            { label: "Total", value: maintenanceCount, bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-500", border: "border-blue-100 dark:border-blue-900" },
            { label: "Resolved", value: Math.max(0, maintenanceCount - openIssues), bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-500", border: "border-emerald-100 dark:border-emerald-900" },
          ].map(({ label, value, bg, text, border }) => (
            <div key={label} className={`rounded-2xl ${bg} border ${border} py-4 text-center`}>
              <p className={`text-3xl font-bold ${text}`}>{value}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Alert if open issues */}
        {openIssues > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 mb-5">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                {openIssues} issue{openIssues !== 1 ? "s" : ""} need attention
              </p>
              <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-0.5">
                Your landlord is handling open requests
              </p>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link href="/tenant/maintenance" onClick={() => setSheet(null)}>
            <Button variant="outline" className="w-full rounded-2xl h-12 border-slate-200 dark:border-white/10">
              View All
            </Button>
          </Link>
          <Link href="/tenant/maintenance/new" onClick={() => setSheet(null)}>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl h-12">
              <Plus className="w-4 h-4 mr-1.5" /> New Request
            </Button>
          </Link>
        </div>
      </BottomSheet>

      {/* ── PROFILE SHEET ── */}
      <BottomSheet open={sheet === "profile"} onClose={() => setSheet(null)}>
        <div className="flex items-center justify-between py-4 mb-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Profile</h2>
          <button onClick={() => setSheet(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500 dark:text-slate-300" />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center py-5 mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-lg shadow-blue-500/30">
            {T.fullName.charAt(0).toUpperCase()}
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{T.fullName}</p>
          <p className="text-xs text-slate-400 mt-0.5">Tenant</p>
        </div>

        {/* Info list */}
        <div className="space-y-2 mb-5">
          {[
            { icon: Phone, label: "Phone", value: T.phone || "Not provided" },
            { icon: Mail, label: "Email", value: T.email },
            { icon: Home, label: "Home", value: unit && property ? `${property.name}, Unit ${unit.unitNumber}` : "Not assigned" },
          ].filter(r => r.value).map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <Link href="/tenant/profile" onClick={() => setSheet(null)}>
          <Button className="w-full rounded-2xl h-12 bg-blue-600 hover:bg-blue-700 text-white">
            Edit Profile
          </Button>
        </Link>
      </BottomSheet>
    </>
  );
}

/* ── Utility Screens ────────────────────────────────────────────────────── */
function Loader({ label }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
function ErrorState({ title, body }) {
  return (
    <div className="flex items-center justify-center min-h-screen px-6">
      <div className="text-center max-w-xs">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
        <p className="text-sm text-slate-500">{body}</p>
      </div>
    </div>
  );
}