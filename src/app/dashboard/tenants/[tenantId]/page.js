"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { 
  Phone, 
  Mail, 
  Home, 
  Calendar, 
  Wrench, 
  ArrowLeft,
  Building2,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  User,
  Edit,
  Trash2,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TenantDetailPage() {
  const { tenantId } = useParams();

  const data = tenantId ? useQuery(api.tenants.getTenant, { tenantId }) : null;
  const vacateTenant = useMutation(api.tenants.vacateTenant);

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">No tenant selected</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading tenant details…</p>
        </div>
      </div>
    );
  }

  if (!data.tenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Tenant not found</p>
          <Link href="/dashboard/tenants">
            <Button variant="outline" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tenants
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { tenant, unit, property } = data;

  async function handleVacate() {
    if (!confirm("Are you sure you want to vacate this tenant? This action will mark their lease as inactive.")) return;

    try {
      await vacateTenant({ tenantId });
      toast.success("Tenant vacated successfully", {
        description: "The lease has been marked as inactive."
      });
    } catch (err) {
      toast.error("Failed to vacate tenant", {
        description: "Please try again or contact support."
      });
      console.error(err);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Back Navigation */}
      <Link
        href="/dashboard/tenants"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Tenants
      </Link>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-600/30">
            {tenant.fullName?.charAt(0).toUpperCase() || "T"}
          </div>
          
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              {tenant.fullName || "—"}
            </h1>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${
                tenant.status === "active"
                  ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                {tenant.status === "active" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                {tenant.status || "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className="rounded-xl border-slate-300 dark:border-white/20"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button 
            variant="outline"
            className="rounded-xl border-slate-300 dark:border-white/20"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Contact Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Phone Number
                  </p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {tenant.phone || "Not provided"}
                  </p>
                </div>
              </div>

              {tenant.email && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Email Address
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white break-all">
                      {tenant.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Property & Unit Information */}
          <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Property & Unit Details
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Property
                  </p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {property?.name || "Not assigned"}
                  </p>
                  {property?.location && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {property.location}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Unit Number
                  </p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {unit?.unitNumber || tenant.unitId || "Not assigned"}
                  </p>
                </div>
              </div>

              {tenant.unitId && (
                <Link
                  href={`/dashboard/units/${unit?._id || tenant.unitId}`}
                  className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
                >
                  View full unit details
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              )}
            </div>
          </div>

          {/* Lease Information */}
          <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Lease Agreement
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Lease Period
                  </p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {tenant.leaseStart || "—"} → {tenant.leaseEnd || "—"}
                  </p>
                </div>
              </div>

              {tenant.leaseStart && tenant.leaseEnd && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Duration:</strong> {calculateLeaseDuration(tenant.leaseStart, tenant.leaseEnd)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Maintenance Section */}
          {tenant.unitId && (
            <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Maintenance Requests
                </h2>
              </div>
              <div className="p-6">
                <Link
                  href={`/dashboard/tenants/${tenant._id}/maintenance`}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        View All Requests
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Track and manage maintenance issues
                      </p>
                    </div>
                  </div>
                  <ArrowLeft className="w-5 h-5 rotate-180 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Right Column (1/3) */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
              <Button variant="outline" className="w-full rounded-xl justify-start border-slate-300 dark:border-white/20">
                <FileText className="w-4 h-4 mr-2" />
                View Lease
              </Button>
              <Button variant="outline" className="w-full rounded-xl justify-start border-slate-300 dark:border-white/20">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Visit
              </Button>
            </div>
          </div>

          {/* Lease Status */}
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Lease Status
              </h3>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
              Current lease is {tenant.status === "active" ? "active" : "inactive"} and {tenant.leaseEnd ? `expires on ${tenant.leaseEnd}` : "has no end date set"}.
            </p>
            {tenant.status === "active" && (
              <div className="pt-4 border-t border-emerald-200 dark:border-emerald-800">
                <Button 
                  variant="destructive" 
                  onClick={handleVacate}
                  className="w-full rounded-xl"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Vacate Tenant
                </Button>
              </div>
            )}
          </div>

          {/* Important Notes */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/10 p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              📋 Notes
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Keep track of important tenant information, payment history, and any special considerations here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate lease duration
function calculateLeaseDuration(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  const days = diffDays % 30;
  
  if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''} ${days > 0 ? `and ${days} day${days > 1 ? 's' : ''}` : ''}`;
  }
  return `${days} day${days > 1 ? 's' : ''}`;
}