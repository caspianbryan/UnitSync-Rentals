"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DollarSign, Smartphone, Landmark, Banknote,
  ArrowLeft, Upload, CheckCircle2, Clock, X, AlertCircle, Camera
} from "lucide-react";
import { toast } from "sonner";

const METHOD = {
  mpesa: { label: "M-Pesa", icon: Smartphone, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  bank: { label: "Bank", icon: Landmark, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
  cash: { label: "Cash", icon: Banknote, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800" },
};

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(month) {
  const [year, m] = month.split("-");
  return new Date(year, parseInt(m) - 1).toLocaleString("default", { month: "long", year: "numeric" });
}

export default function SubmitPaymentProofPage() {
  const { user } = useUser();
  const router = useRouter();
  const thisMonth = currentMonth();

  const tenant = useQuery(
    api.tenants.getTenantByEmail,
    user?.emailAddresses?.[0]?.emailAddress ? { email: user.emailAddresses[0].emailAddress } : "skip"
  );
  const data = useQuery(
    api.tenants.getTenantDashboard,
    tenant?._id ? { tenantId: tenant._id } : "skip"
  );
  const paymentHistory = useQuery(
    api.payments.getTenantPaymentHistory,
    tenant?._id ? { tenantId: tenant._id } : "skip"
  );
  const currentEntry = paymentHistory?.find(e => e.month === thisMonth);

  const submitProof = useMutation(api.paymentSubmissions.submitPaymentProof);

  const [method, setMethod] = useState("mpesa");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!tenant || !data) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#0D0D14] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const { tenant: tenantData, unit, property } = data;
  const balance = currentEntry ? currentEntry.amountDue - currentEntry.amountPaid : unit?.rentAmount || 0;

  async function handleSubmit(e) {
    e.preventDefault();

    // Only amount is required - reference is optional
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    // Get landlordId from tenant record
    if (!tenantData?.landlordId) {
      toast.error("Unable to find landlord information");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Upload image to storage first if imageFile exists
      // const proofImageUrl = imageFile ? await uploadImage(imageFile) : undefined;

      await submitProof({
        tenantId: tenant._id,
        unitId: tenant.unitId,
        landlordId: tenantData.landlordId,
        propertyId: property._id,
        month: thisMonth,
        amount: parseFloat(amount),
        method,
        referenceNumber: reference.trim() || "NO-REF-PROVIDED", // Use placeholder if empty
        paidDate,
        notes: notes.trim() || undefined,
        // proofImageUrl,
      });

      toast.success("Payment proof submitted!", {
        description: "Your landlord will review it shortly"
      });

      setTimeout(() => router.push("/tenant/payments"), 1000);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to submit");
      setIsSubmitting(false);
    }
  }

  const M = METHOD[method];
  const MIcon = M.icon;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0D0D14]">

      {/* Hero */}
      <div className="relative bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] pb-16 pt-6 px-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <Link href="/tenant/payments" className="inline-flex items-center gap-2 text-blue-300/70 text-sm mb-6 hover:text-blue-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <p className="text-blue-300/70 text-xs font-medium uppercase tracking-wide">Submit Proof</p>
            <h1 className="text-white text-xl font-bold">I've Paid Rent</h1>
          </div>
        </div>

        {/* Current balance */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mt-5">
          <p className="text-blue-200/70 text-xs mb-1">Outstanding Balance</p>
          <p className="text-white text-3xl font-bold">KES {balance.toLocaleString()}</p>
          <p className="text-blue-200/70 text-xs mt-1">{getMonthLabel(thisMonth)}</p>
        </div>
      </div>

      {/* Form */}
      <div className="relative -mt-8 px-4 pb-12">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Payment method selector */}
          <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-sm p-5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 block">
              How did you pay? *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(METHOD).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const active = method === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMethod(key)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${active
                        ? `${cfg.border} ${cfg.bg} ${cfg.color}`
                        : "border-slate-200 dark:border-white/10 text-slate-400 hover:border-slate-300 dark:hover:border-white/20"
                      }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-semibold">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount */}
          <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-sm p-5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 block">
              Amount Paid *
            </label>
            <div className="flex items-center gap-3">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">KES</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={balance.toString()}
                className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                disabled={isSubmitting}
              />
            </div>
            {parseFloat(amount) > 0 && parseFloat(amount) < balance && (
              <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                KES {(balance - parseFloat(amount)).toLocaleString()} will remain outstanding
              </p>
            )}
          </div>

          {/* Reference number */}
          <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-sm p-5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 block">
              {method === "mpesa" && "M-Pesa Code (Optional)"}
              {method === "bank" && "Bank Reference"}
              {method === "cash" && "Receipt Number (Optional)"}
            </label>

            {/* Helpful info box */}
            {method === "mpesa" && (
              <div className="mb-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-2 font-semibold">
                  💡 Where to find your M-Pesa code:
                </p>
                <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 ml-4 list-disc">
                  <li>Check your M-Pesa confirmation SMS</li>
                  <li>Look for the transaction ID (e.g., QA12BC34DE)</li>
                  <li>If you don't have it, you can leave this blank</li>
                </ul>
              </div>
            )}

            {method === "bank" && (
              <div className="mb-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-2 font-semibold">
                  💡 Where to find bank reference:
                </p>
                <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 ml-4 list-disc">
                  <li>Check your bank statement or receipt</li>
                  <li>Look for transaction reference number</li>
                  <li>Usually starts with letters like TRF or TXN</li>
                </ul>
              </div>
            )}

            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value.toUpperCase())}
              placeholder={
                method === "mpesa" ? "QA12BC34DE (if you have it)" :
                  method === "bank" ? "TXN12345" :
                    "Optional"
              }
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-slate-900 dark:text-white placeholder:text-slate-400 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              disabled={isSubmitting}
            />

            {method === "cash" && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Only fill if you received a receipt
              </p>
            )}
          </div>

          {/* Date */}
          <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-sm p-5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 block">
              Payment Date *
            </label>
            <input
              type="date"
              value={paidDate}
              onChange={e => setPaidDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Upload proof (optional) */}
          <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-sm p-5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 block">
              Upload Proof (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl p-6 text-center">
              {imageFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{imageFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Upload screenshot or receipt
                  </p>
                  <p className="text-xs text-slate-400">JPG, PNG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                    disabled={isSubmitting}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-[#1C1C28] rounded-2xl shadow-sm p-5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 block">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional info..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Info box */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">What happens next?</p>
            </div>
            <ul className="space-y-1.5">
              {[
                "Your landlord will be notified",
                "They'll verify the payment details",
                "You'll get a confirmation within 24hrs",
                "Status will update to 'Paid' when approved"
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
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl h-12 text-sm font-semibold transition-all ${isSubmitting || !amount || parseFloat(amount) <= 0
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Submit Proof
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