"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, AlertCircle,
  CheckCircle2, Clock, Building2, Home, Plus,
  Smartphone, Landmark, Banknote, ChevronLeft,
  ChevronRight, Loader2, X, Search, Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMonthLabel(month) {
  const [year, m] = month.split("-");
  return new Date(year, parseInt(m) - 1).toLocaleString("default", { month: "long", year: "numeric" });
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function prevMonth(month) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 2);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function nextMonth(month) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const METHOD_CONFIG = {
  mpesa: { label: "M-Pesa", icon: Smartphone, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-950/30" },
  bank:  { label: "Bank Transfer", icon: Landmark, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-950/30" },
  cash:  { label: "Cash", icon: Banknote, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-950/30" },
};

const STATUS_CONFIG = {
  paid:    { label: "Paid",    color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-950/30", icon: CheckCircle2 },
  partial: { label: "Partial", color: "text-orange-700 dark:text-orange-400",  bg: "bg-orange-100 dark:bg-orange-950/30",  icon: Clock },
  unpaid:  { label: "Unpaid",  color: "text-red-700 dark:text-red-400",        bg: "bg-red-100 dark:bg-red-950/30",        icon: AlertCircle },
  overdue: { label: "Overdue", color: "text-red-700 dark:text-red-400",        bg: "bg-red-100 dark:bg-red-950/30",        icon: AlertCircle },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RentDashboard() {
  const { user } = useUser();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentDialog, setPaymentDialog] = useState(null); // ledger entry to pay
  const [isGenerating, setIsGenerating] = useState(false);

  const convexUser = useQuery(
    api.users.getByClerkId,
    user ? { clerkUserId: user.id } : "skip"
  );

  const ledger = useQuery(
    api.payments.getLandlordLedger,
    convexUser?._id ? { landlordId: convexUser._id, month: selectedMonth } : "skip"
  );

  const generateLedger = useMutation(api.payments.generateMonthlyLedger);

  const loading = !convexUser || ledger === undefined;

  // ─── Generate ledger if empty ───────────────────────────────────────────────
  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const result = await generateLedger({
        landlordId: convexUser._id,
        month: selectedMonth,
      });
      if (result.created === 0) {
        toast.info("Ledger already exists for this month");
      } else {
        toast.success(`Generated ${result.created} rent entries for ${getMonthLabel(selectedMonth)}`);
      }
    } catch (e) {
      toast.error("Failed to generate ledger");
    } finally {
      setIsGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading rent data…</p>
        </div>
      </div>
    );
  }

  // ─── Metrics ────────────────────────────────────────────────────────────────
  const totalDue     = ledger.reduce((s, e) => s + e.amountDue, 0);
  const totalPaid    = ledger.reduce((s, e) => s + e.amountPaid, 0);
  const outstanding  = totalDue - totalPaid;
  const collRate     = totalDue > 0 ? ((totalPaid / totalDue) * 100).toFixed(1) : "0.0";
  const paidCount    = ledger.filter(e => e.status === "paid").length;
  const partialCount = ledger.filter(e => e.status === "partial").length;
  const unpaidCount  = ledger.filter(e => e.status === "unpaid" || e.status === "overdue").length;

  // ─── Filter ─────────────────────────────────────────────────────────────────
  const filtered = ledger.filter(e => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.tenant?.fullName?.toLowerCase().includes(q) ||
      e.property?.name?.toLowerCase().includes(q) ||
      e.unit?.unitNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Rent & Payments
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track rent collection and payment status
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Generate {getMonthLabel(selectedMonth)} Ledger
        </Button>
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-4 bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 p-4">
        <button
          onClick={() => setSelectedMonth(prevMonth(selectedMonth))}
          className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>

        <div className="flex-1 text-center">
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {getMonthLabel(selectedMonth)}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {ledger.length} tenant{ledger.length !== 1 ? "s" : ""} in ledger
          </p>
        </div>

        <button
          onClick={() => setSelectedMonth(nextMonth(selectedMonth))}
          disabled={selectedMonth >= currentMonth()}
          className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={DollarSign} label="Total Expected" value={`KES ${totalDue.toLocaleString()}`}    sublabel={`${ledger.length} tenants`}      bg="bg-blue-100 dark:bg-blue-950/30"   color="text-blue-600 dark:text-blue-400" />
        <MetricCard icon={CheckCircle2} label="Collected"    value={`KES ${totalPaid.toLocaleString()}`}  sublabel={`${paidCount} paid in full`}     bg="bg-emerald-100 dark:bg-emerald-950/30" color="text-emerald-600 dark:text-emerald-400" trend={{ value: `${collRate}%`, positive: parseFloat(collRate) >= 80 }} />
        <MetricCard icon={AlertCircle}  label="Outstanding"  value={`KES ${outstanding.toLocaleString()}`} sublabel={`${unpaidCount} unpaid`}        bg="bg-red-100 dark:bg-red-950/30"     color="text-red-600 dark:text-red-400" />
        <MetricCard icon={TrendingUp}   label="Collection Rate" value={`${collRate}%`}                    sublabel={`${partialCount} partial`}       bg="bg-purple-100 dark:bg-purple-950/30" color="text-purple-600 dark:text-purple-400" trend={{ value: parseFloat(collRate) >= 90 ? "Excellent" : parseFloat(collRate) >= 70 ? "Good" : "Monitor", positive: parseFloat(collRate) >= 70 }} />
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-4">
        <MiniStatus label="Paid"    count={paidCount}    total={ledger.length} color="emerald" />
        <MiniStatus label="Partial" count={partialCount} total={ledger.length} color="orange" />
        <MiniStatus label="Unpaid"  count={unpaidCount}  total={ledger.length} color="red" />
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10">
        <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by tenant, property, or unit..."
          className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")}>
            <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>

      {/* Ledger Table */}
      {ledger.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10">
          <Receipt className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No Ledger for {getMonthLabel(selectedMonth)}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
            Click "Generate Ledger" to create rent entries for all your tenants this month.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate Now
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">
              {getMonthLabel(selectedMonth)} — Rent Ledger
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {filtered.length} records
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/10">
            {filtered.map(entry => (
              <LedgerRow
                key={entry._id}
                entry={entry}
                onRecordPayment={() => setPaymentDialog(entry)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Payment Dialog */}
      {paymentDialog && (
        <RecordPaymentDialog
          entry={paymentDialog}
          landlordId={convexUser._id}
          onClose={() => setPaymentDialog(null)}
        />
      )}
    </div>
  );
}

// ─── Ledger Row ───────────────────────────────────────────────────────────────
function LedgerRow({ entry, onRecordPayment }) {
  const status = STATUS_CONFIG[entry.status] || STATUS_CONFIG.unpaid;
  const StatusIcon = status.icon;
  const balance = entry.amountDue - entry.amountPaid;

  return (
    <div className="px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
      {/* Tenant Info */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
          {entry.tenant?.fullName?.charAt(0).toUpperCase() || "?"}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white truncate">
            {entry.tenant?.fullName || "Unknown"}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Building2 className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{entry.property?.name}</span>
            <span>•</span>
            <Home className="w-3 h-3 flex-shrink-0" />
            <span>Unit {entry.unit?.unitNumber}</span>
          </div>
        </div>
      </div>

      {/* Amounts */}
      <div className="flex items-center gap-6 lg:gap-8">
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Due</p>
          <p className="font-bold text-slate-900 dark:text-white text-sm">
            KES {entry.amountDue.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Paid</p>
          <p className={`font-bold text-sm ${entry.amountPaid > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
            KES {entry.amountPaid.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Balance</p>
          <p className={`font-bold text-sm ${balance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            KES {balance.toLocaleString()}
          </p>
        </div>

        {/* Status Badge */}
        <span className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg} ${status.color} text-xs font-semibold`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>

        {/* Record Payment Button */}
        {entry.status !== "paid" && (
          <Button
            size="sm"
            onClick={onRecordPayment}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-1" />
            Record Payment
          </Button>
        )}
        {entry.status === "paid" && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Fully Paid
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Record Payment Dialog ────────────────────────────────────────────────────
function RecordPaymentDialog({ entry, landlordId, onClose }) {
  const today = new Date().toISOString().split("T")[0];
  const balance = entry.amountDue - entry.amountPaid;

  const [amount, setAmount] = useState(String(balance));
  const [method, setMethod] = useState("mpesa");
  const [reference, setReference] = useState("");
  const [paidDate, setPaidDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recordPayment = useMutation(api.payments.recordPayment);

  async function handleSubmit() {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (method !== "cash" && !reference.trim()) {
      toast.error(`Please enter the ${method === "mpesa" ? "M-Pesa code" : "bank reference"}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await recordPayment({
        tenantId: entry.tenantId,
        landlordId,
        month: entry.month,
        amount: Number(amount),
        method,
        referenceNumber: reference.trim() || undefined,
        paidDate,
        notes: notes.trim() || undefined,
      });

      toast.success("Payment recorded successfully!", {
        description: `KES ${Number(amount).toLocaleString()} via ${METHOD_CONFIG[method].label}`
      });
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent  className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            Record Payment
          </DialogTitle>
        </DialogHeader>

        {/* Tenant Summary */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 mt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {entry.tenant?.fullName}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {entry.property?.name} • Unit {entry.unit?.unitNumber} • {getMonthLabel(entry.month)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400">Balance Due</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                KES {balance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 mt-2">
          {/* Payment Method */}
          <div>
            <Label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">
              Payment Method *
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(METHOD_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = method === key;
                return (
                  <button
                    key={key}
                    onClick={() => setMethod(key)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                        : "border-slate-200 dark:border-white/10 hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${isSelected ? config.bg : "bg-slate-100 dark:bg-slate-800"} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${isSelected ? config.color : "text-slate-400"}`} />
                    </div>
                    <span className={`text-xs font-semibold ${isSelected ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"}`}>
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
              Amount (KES) *
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="rounded-xl border-slate-300 dark:border-white/10 h-12"
            />
            {Number(amount) < balance && Number(amount) > 0 && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                ⚠️ Partial payment — KES {(balance - Number(amount)).toLocaleString()} will remain outstanding
              </p>
            )}
          </div>

          {/* Reference Number */}
          {method !== "cash" && (
            <div>
              <Label htmlFor="ref" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                {method === "mpesa" ? "M-Pesa Code *" : "Bank Reference No. *"}
              </Label>
              <Input
                id="ref"
                value={reference}
                onChange={e => setReference(e.target.value.toUpperCase())}
                placeholder={method === "mpesa" ? "e.g., QA12BC34DE" : "e.g., TRF/2025/001234"}
                className="rounded-xl border-slate-300 dark:border-white/10 h-12 font-mono"
              />
            </div>
          )}

          {/* Date */}
          <div>
            <Label htmlFor="date" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
              Payment Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={paidDate}
              max={today}
              onChange={e => setPaidDate(e.target.value)}
              className="rounded-xl border-slate-300 dark:border-white/10 h-12"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
              Notes <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g., Late payment, requested receipt..."
              className="rounded-xl border-slate-300 dark:border-white/10 h-12"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Recording...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" />Confirm Payment</>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl h-12 px-6 border-slate-300 dark:border-white/20"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, sublabel, bg, color, trend }) {
  return (
    <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trend.positive ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400"}`}>
            {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{sublabel}</p>
    </div>
  );
}

// ─── Mini Status ──────────────────────────────────────────────────────────────
function MiniStatus({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const colors = {
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200 dark:border-emerald-800", bar: "bg-emerald-600", text: "text-emerald-700 dark:text-emerald-400" },
    orange:  { bg: "bg-orange-50 dark:bg-orange-950/20",  border: "border-orange-200 dark:border-orange-800",  bar: "bg-orange-600",  text: "text-orange-700 dark:text-orange-400" },
    red:     { bg: "bg-red-50 dark:bg-red-950/20",        border: "border-red-200 dark:border-red-800",        bar: "bg-red-600",     text: "text-red-700 dark:text-red-400" },
  };
  const c = colors[color];
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-5`}>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${c.text} mb-3`}>{count}</p>
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${c.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{pct}% of {total}</p>
    </div>
  );
}