"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import {
  User, Home, Calendar, Phone, Mail, MapPin,
  Edit3, Save, X, Building2, DollarSign,
  Clock, CheckCircle2, ArrowLeft, Shield, LogOut
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TenantProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedPhone, setEditedPhone] = useState("");

  const tenant = useQuery(
    api.tenants.getTenantByEmail,
    user?.emailAddresses?.[0]?.emailAddress ? { email: user.emailAddresses[0].emailAddress } : "skip"
  );
  const data = useQuery(
    api.tenants.getTenantProfile,
    tenant?._id ? { tenantId: tenant._id } : "skip"
  );
  const updatePhone = useMutation(api.tenants.updateTenantPhone);

  if (!tenant || !data) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#0D0D14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  const { tenant: T, unit, property } = data;

  const leaseDuration = () => {
    if (!T.leaseStart || !T.leaseEnd) return null;
    const days = Math.ceil((new Date(T.leaseEnd) - new Date(T.leaseStart)) / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    return months > 0 ? `${months} month${months !== 1 ? "s" : ""}` : `${days} days`;
  };

  async function handleSave() {
    try {
      await updatePhone({ tenantId: tenant._id, phone: editedPhone });
      toast.success("Phone number updated");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update phone");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0D0D14]">

      {/* ── HERO ── */}
      <div className="relative bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] pb-20 pt-6 px-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl translate-y-1/2 pointer-events-none" />

        <Link href="/tenant" className="inline-flex items-center gap-2 text-blue-300/70 text-sm mb-6 hover:text-blue-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-500/30">
              {T.fullName.charAt(0).toUpperCase()}
            </div>
            {/* Online badge */}
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#16213e]" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-0.5">{T.fullName}</h1>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-xs font-semibold">Active Tenant</span>
          </div>
          {property && unit && (
            <p className="text-blue-300/60 text-xs mt-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {property.name} · Unit {unit.unitNumber}
            </p>
          )}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="relative -mt-10 px-4 pb-28 space-y-4">

        {/* ── Contact Info Card ── */}
        <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Contact Info</span>
            </div>
            {!isEditing ? (
              <button
                onClick={() => { setEditedPhone(T.phone || ""); setIsEditing(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-xs font-semibold"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold"
                >
                  <Save className="w-3 h-3" /> Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
              </div>
            )}
          </div>

          <div className="divide-y divide-slate-50 dark:divide-white/5">
            {/* Name */}
            <InfoRow icon={User} label="Full Name" value={T.fullName} />

            {/* Phone — editable */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 mb-0.5">Phone</p>
                {isEditing ? (
                  <input
                    value={editedPhone}
                    onChange={e => setEditedPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-blue-300 dark:border-blue-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {T.phone || <span className="text-slate-400 font-normal">Not provided</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            {T.email && <InfoRow icon={Mail} label="Email" value={T.email} truncate />}
          </div>
        </div>

        {/* ── My Home Card ── */}
        {unit && property && (
          <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-slate-100 dark:border-white/5">
              <Home className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">My Home</span>
            </div>

            {/* Property banner */}
            <div className="mx-4 mt-3 mb-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-white">
              <Building2 className="w-6 h-6 text-white/60 mb-2" />
              <p className="text-lg font-bold">{property.name}</p>
              <p className="text-blue-200 text-sm">Unit {unit.unitNumber}</p>
              {property.location && (
                <div className="flex items-center gap-1.5 mt-2 text-blue-200/70 text-xs">
                  <MapPin className="w-3 h-3" />
                  <span>{property.location}</span>
                </div>
              )}
            </div>

            <div className="divide-y divide-slate-50 dark:divide-white/5 pb-1">
              <InfoRow icon={DollarSign} label="Monthly Rent" value={`KES ${(unit.rentAmount || 0).toLocaleString()}`} highlight />
              <InfoRow icon={Building2} label="Property" value={property.name} />
              <InfoRow icon={Home} label="Unit" value={`Unit ${unit.unitNumber}`} />
            </div>
          </div>
        )}

        {/* ── Lease Card ── */}
        <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Lease Agreement</span>
            {T.leaseStart && T.leaseEnd && (
              <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Active</span>
              </div>
            )}
          </div>

          {T.leaseStart && T.leaseEnd ? (
            <div className="p-4 space-y-3">
              {/* Start / End side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
                  <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">Start</p>
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
                    {new Date(T.leaseStart).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase mb-1">End</p>
                  <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                    {new Date(T.leaseEnd).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              {leaseDuration() && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Duration</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{leaseDuration()}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No lease info on file</p>
            </div>
          )}
        </div>

        {/* ── Account Info Card ── */}
        <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Account</span>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-white/5">
            <InfoRow icon={CheckCircle2} label="Status" value="Active" highlight />
            <InfoRow icon={Calendar} label="Member Since" value={new Date(T._creationTime).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })} />
          </div>
        </div>

        {/* ── Logout Button ── */}
        <button
          onClick={() => signOut(() => router.push("/"))}
          className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-4 text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <BottomNav active="me" />
    </div>
  );
}

/* ── Info Row ─────────────────────────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value, highlight, truncate }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <p className={`text-sm font-semibold ${highlight ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"} ${truncate ? "truncate" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ── Bottom Nav ─────────────────────────────────────────────────────────── */
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