"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import {
  CheckCircle2, X, Clock, AlertCircle, 
  Smartphone, Landmark, Banknote, FileText,
  Calendar, User, Building2, Eye, ThumbsUp, ThumbsDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const METHOD = {
  mpesa: { label: "M-Pesa",  icon: Smartphone, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  bank:  { label: "Bank",    icon: Landmark,   color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-950/30" },
  cash:  { label: "Cash",    icon: Banknote,   color: "text-orange-600 dark:text-orange-400",   bg: "bg-orange-50 dark:bg-orange-950/30" },
};

const STATUS = {
  pending:  { label: "Pending",  color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-200 dark:border-orange-800", icon: Clock },
  approved: { label: "Approved", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200 dark:border-emerald-800", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-200 dark:border-red-800", icon: X },
};

function getMonthLabel(month) {
  const [year, m] = month.split("-");
  return new Date(year, parseInt(m) - 1).toLocaleString("default", { month: "long", year: "numeric" });
}

export default function PaymentSubmissionsPage() {
  const { user } = useUser();
  const [filter, setFilter] = useState("pending"); // "pending" | "approved" | "rejected" | "all"
  const [reviewingId, setReviewingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const convexUser = useQuery(api.users.getByClerkId, user ? { clerkUserId: user.id } : "skip");
  
  // Get all submissions for admin, or landlord-specific for landlords
  const allPendingSubmissions = useQuery(
    api.paymentSubmissions.getAllPendingSubmissions,
    convexUser?.isAdmin ? {} : "skip"
  );
  
  const landlordPendingSubmissions = useQuery(
    api.paymentSubmissions.getPendingSubmissions,
    convexUser?.isLandlord ? { landlordId: convexUser._id } : "skip"
  );

  const allSubmissionsForAdmin = useQuery(
    api.paymentSubmissions.getAllSubmissions,
    convexUser?.isAdmin ? { status: filter === "all" ? undefined : filter } : "skip"
  );
  
  const landlordSubmissions = useQuery(
    api.paymentSubmissions.getLandlordSubmissions,
    convexUser?.isLandlord ? { 
      landlordId: convexUser._id,
      status: filter === "all" ? undefined : filter
    } : "skip"
  );

  const approveSubmission = useMutation(api.paymentSubmissions.approveSubmission);
  const rejectSubmission = useMutation(api.paymentSubmissions.rejectSubmission);

  if (!convexUser) return <Loader />;
  if (!convexUser.isLandlord && !convexUser.isAdmin) return <AccessDenied />;

  // Use admin data if admin, landlord data if landlord
  const pendingSubmissions = convexUser?.isAdmin ? allPendingSubmissions : landlordPendingSubmissions;
  const allSubmissions = convexUser?.isAdmin ? allSubmissionsForAdmin : landlordSubmissions;
  
  const submissions = filter === "pending" ? pendingSubmissions : allSubmissions;
  const pendingCount = pendingSubmissions?.length || 0;

  async function handleApprove(submissionId) {
    try {
      await approveSubmission({
        submissionId,
        reviewedBy: convexUser._id,
      });
      toast.success("Payment approved!", {
        description: "Payment record created and ledger updated"
      });
      setReviewingId(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to approve");
    }
  }

  async function handleReject(submissionId) {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      await rejectSubmission({
        submissionId,
        reviewedBy: convexUser._id,
        reason: rejectionReason.trim(),
      });
      toast.success("Payment rejected");
      setReviewingId(null);
      setRejectionReason("");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to reject");
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Payment Submissions
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Review and approve tenant payment proofs
        </p>
      </div>

      {/* Alert if pending */}
      {pendingCount > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
          <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
              {pendingCount} payment{pendingCount !== 1 ? "s" : ""} waiting for review
            </p>
            <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-0.5">
              Approve or reject to update tenant balances
            </p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-white/10">
        {[
          { key: "pending", label: "Pending", count: pendingCount },
          { key: "approved", label: "Approved" },
          { key: "rejected", label: "Rejected" },
          { key: "all", label: "All" },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 text-sm font-semibold transition-colors relative ${
              filter === key
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {label}
            {count > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 text-xs font-bold">
                {count}
              </span>
            )}
            {filter === key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        ))}
      </div>

      {/* Submissions list */}
      {!submissions || submissions.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10">
          <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No {filter === "all" ? "" : filter} submissions
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filter === "pending" 
              ? "You're all caught up! No pending reviews."
              : `No ${filter} payment submissions yet.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const s = STATUS[submission.status];
            const SIcon = s.icon;
            const m = METHOD[submission.method];
            const MIcon = m.icon;
            const isReviewing = reviewingId === submission._id;

            return (
              <div
                key={submission._id}
                className={`bg-white dark:bg-[#1F1F27] rounded-2xl border ${s.border} overflow-hidden`}
              >
                {/* Status bar */}
                <div className={`h-1.5 ${s.bg}`} />

                <div className="p-6">
                  {/* Header row */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      {/* Tenant avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {submission.tenant?.fullName.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {submission.tenant?.fullName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {submission.property?.name} · Unit {submission.unit?.unitNumber}
                        </div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${s.bg} border ${s.border}`}>
                      <SIcon className={`w-4 h-4 ${s.color}`} />
                      <span className={`text-sm font-bold ${s.color}`}>{s.label}</span>
                    </div>
                  </div>

                  {/* Payment details grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <DetailBox icon={Calendar} label="Month" value={getMonthLabel(submission.month)} />
                    <DetailBox icon={MIcon} label="Method" value={m.label} color={m.color} />
                    <DetailBox 
                      icon={FileText} 
                      label="Reference" 
                      value={submission.referenceNumber}
                      mono 
                    />
                    <DetailBox 
                      icon={CheckCircle2} 
                      label="Amount" 
                      value={`KES ${submission.amount.toLocaleString()}`}
                      color="text-emerald-600 dark:text-emerald-400"
                      highlight
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    Submitted {new Date(submission.submittedAt).toLocaleString()}
                  </div>

                  {/* Notes */}
                  {submission.notes && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-4">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        TENANT NOTES
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {submission.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions based on status */}
                  {submission.status === "pending" && (
                    <>
                      {!isReviewing ? (
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleApprove(submission._id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11"
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Approve & Record Payment
                          </Button>
                          <Button
                            onClick={() => setReviewingId(submission._id)}
                            variant="outline"
                            className="rounded-xl h-11 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                          <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                            Why are you rejecting this payment?
                          </p>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g., Incorrect amount, invalid reference number, duplicate submission..."
                            className="w-full px-3 py-2 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-[#0A0A0F] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleReject(submission._id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                              disabled={!rejectionReason.trim()}
                            >
                              Confirm Rejection
                            </Button>
                            <Button
                              onClick={() => {
                                setReviewingId(null);
                                setRejectionReason("");
                              }}
                              variant="outline"
                              className="rounded-xl"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Show review info for approved/rejected */}
                  {submission.status !== "pending" && (
                    <div className={`p-4 rounded-xl ${s.bg} border ${s.border}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-semibold ${s.color}`}>
                            {submission.status === "approved" ? "Approved" : "Rejected"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {new Date(submission.reviewedAt).toLocaleString()}
                          </p>
                        </div>
                        {submission.status === "approved" && submission.paymentId && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            Payment recorded ✓
                          </span>
                        )}
                      </div>
                      {submission.rejectionReason && (
                        <p className="text-sm text-red-700 dark:text-red-300 mt-3 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                          <strong>Reason:</strong> {submission.rejectionReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DetailBox({ icon: Icon, label, value, color, mono, highlight }) {
  return (
    <div className={`p-3 rounded-xl ${highlight ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800" : "bg-slate-50 dark:bg-slate-800/50"}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-3.5 h-3.5 ${color || "text-slate-400"}`} />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
          {label}
        </p>
      </div>
      <p className={`text-sm font-bold ${color || "text-slate-900 dark:text-white"} ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-sm text-slate-500">You don't have landlord access.</p>
      </div>
    </div>
  );
}