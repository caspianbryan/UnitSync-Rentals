"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  PlayCircle,
  Wrench,
  ArrowLeft,
  Building2,
  Home,
  Calendar,
  Circle
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function TenantMaintenancePage() {
  const { tenantId } = useParams();

  const tenantData = useQuery(
    api.tenants.getTenant,
    tenantId ? { tenantId } : "skip"
  );

  const requests = useQuery(
    api.maintenance.getRequestsForTenant,
    tenantId ? { tenantId } : "skip"
  );

  const createRequest = useMutation(api.maintenance.createRequest);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!tenantData || !requests) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading maintenance requests…</p>
        </div>
      </div>
    );
  }

  const { tenant, unit, property } = tenantData;

  // Stats
  const openCount = requests.filter(r => r.status === "open").length;
  const inProgressCount = requests.filter(r => r.status === "in_progress").length;
  const resolvedCount = requests.filter(r => r.status === "resolved").length;

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequest({
        tenantId,
        unitId: tenant.unitId,
        title: title.trim(),
        description: description.trim(),
      });

      toast.success("Request submitted successfully!", {
        description: "Your landlord has been notified"
      });
      setTitle("");
      setDescription("");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Back Navigation */}
      <Link
        href={`/dashboard/tenants/${tenantId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Tenant
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/30">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Maintenance Requests
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Home className="w-4 h-4" />
                <span className="font-medium">{tenant?.fullName || "—"}</span>
              </div>
              {unit && (
                <>
                  <span className="text-slate-400">•</span>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>Unit {unit.unitNumber}</span>
                  </div>
                </>
              )}
              {property && (
                <>
                  <span className="text-slate-400">•</span>
                  <span>{property.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={() => setOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Circle, label: "Total", value: requests.length, color: "blue" },
          { icon: AlertCircle, label: "Open", value: openCount, color: "red" },
          { icon: PlayCircle, label: "In Progress", value: inProgressCount, color: "orange" },
          { icon: CheckCircle2, label: "Resolved", value: resolvedCount, color: "emerald" },
        ].map(({ icon: Icon, label, value, color }) => {
          const colors = {
            blue: { bg: "bg-blue-100 dark:bg-blue-950/30", icon: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
            red: { bg: "bg-red-100 dark:bg-red-950/30", icon: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
            orange: { bg: "bg-orange-100 dark:bg-orange-950/30", icon: "text-orange-600 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800" },
            emerald: { bg: "bg-emerald-100 dark:bg-emerald-950/30", icon: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
          };
          const c = colors[color];
          return (
            <div key={label} className={`bg-white dark:bg-[#1F1F27] border ${c.border} rounded-2xl p-6`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${c.icon}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Requests - Empty or Kanban */}
      {requests.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            No Maintenance Requests
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            No requests have been submitted for this tenant yet.
          </p>
          <Button
            onClick={() => setOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Request
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StatusColumn
            title="Open"
            icon={AlertCircle}
            color="red"
            requests={requests.filter(r => r.status === "open")}
          />
          <StatusColumn
            title="In Progress"
            icon={PlayCircle}
            color="orange"
            requests={requests.filter(r => r.status === "in_progress")}
          />
          <StatusColumn
            title="Resolved"
            icon={CheckCircle2}
            color="emerald"
            requests={requests.filter(r => r.status === "resolved")}
          />
        </div>
      )}

      {/* New Request Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              New Maintenance Request
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            <div>
              <Label htmlFor="title" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                Request Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Leaking faucet in kitchen"
                className="rounded-xl border-slate-300 dark:border-white/10 h-12"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                Description *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="rounded-xl border-slate-300 dark:border-white/10 min-h-[120px] resize-none"
                disabled={isSubmitting}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Include as much detail as possible to help resolve quickly
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                className="rounded-xl h-12 px-6 border-slate-300 dark:border-white/20"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusColumn({ title, icon: Icon, color, requests }) {
  const colorClasses = {
    red: {
      header: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
      icon: "text-red-600 dark:text-red-400",
      badge: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
    },
    orange: {
      header: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
      icon: "text-orange-600 dark:text-orange-400",
      badge: "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400",
    },
    emerald: {
      header: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800",
      icon: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    },
  };

  const c = colorClasses[color];

  return (
    <div className="space-y-4">
      {/* Column Header */}
      <div className={`${c.header} border rounded-2xl p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${c.icon}`} />
            <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${c.badge}`}>
            {requests.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
            No {title.toLowerCase()} requests
          </div>
        ) : (
          requests.map(request => (
            <Link
              key={request._id}
              href={`/dashboard/maintenance/${request._id}`}
              className="block bg-white dark:bg-[#1F1F27] rounded-xl border border-slate-200 dark:border-white/10 p-4 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
            >
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                {request.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                {request.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="w-3 h-3" />
                {new Date(request._creationTime).toLocaleDateString()}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}