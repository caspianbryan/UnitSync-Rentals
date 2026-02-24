"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import {
  Plus,
  CheckCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Wrench,
  AlertCircle,
  Circle,
  PlayCircle,
  Calendar,
  Building2,
  Archive,
  History,
  Search,
  LayoutGrid
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function UnitMaintenancePage() {
  const { unitId } = useParams();
  const [activeTab, setActiveTab] = useState("active"); // "active" | "history"
  const [searchQuery, setSearchQuery] = useState("");
  const [openNew, setOpenNew] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const data = useQuery(
    api.units.getUnitWithProperty,
    unitId ? { unitId } : "skip"
  );

  const requests = useQuery(
    api.maintenance.getRequestsForUnit,
    unitId ? { unitId } : "skip"
  );

  const createRequest = useMutation(api.maintenance.createRequest);
  const updateStatus = useMutation(api.maintenance.updateStatus);
  const archiveRequest = useMutation(api.maintenance.archiveRequest);

  if (!unitId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">No unit selected</p>
        </div>
      </div>
    );
  }

  if (!data || !requests) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading maintenance requests…</p>
        </div>
      </div>
    );
  }

  const { unit, property } = data;
  const tenantId = unit?.tenantId;

  // Split active vs archived
  const activeRequests = requests.filter(r => r.status !== "archived");
  const archivedRequests = requests.filter(r => r.status === "archived");

  // Active stats
  const openCount = activeRequests.filter(r => r.status === "open").length;
  const inProgressCount = activeRequests.filter(r => r.status === "in_progress").length;
  const resolvedCount = activeRequests.filter(r => r.status === "resolved").length;

  // Filtered history search
  const filteredArchived = archivedRequests.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.title?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
  });

  async function handleCreateRequest() {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    if (!tenantId) {
      toast.error("No tenant assigned to this unit");
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequest({
        tenantId,
        unitId,
        title: title.trim(),
        description: description.trim(),
      });
      toast.success("Maintenance request created");
      setTitle("");
      setDescription("");
      setOpenNew(false);
    } catch (e) {
      toast.error("Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAdvanceStatus(request) {
    try {
      const nextStatus = request.status === "open" ? "in_progress" : "resolved";
      await updateStatus({ requestId: request._id, status: nextStatus });
      toast.success(`Marked as ${nextStatus.replace("_", " ")}`);
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleArchive(request) {
    try {
      await archiveRequest({ requestId: request._id });
      toast.success("Request archived", {
        description: "Moved to history for record keeping"
      });
    } catch {
      toast.error("Failed to archive request");
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Back Navigation */}
      <Link
        href={tenantId ? `/dashboard/tenants/${tenantId}` : "/dashboard/tenants"}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to {tenantId ? "Tenant" : "Tenants"}
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
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">{property?.name || "—"}</span>
              <span className="text-slate-400">•</span>
              <span>Unit {unit?.unitNumber || "—"}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setOpenNew(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Circle, label: "Total Active", value: activeRequests.length, color: "blue" },
          { icon: AlertCircle, label: "Open", value: openCount, color: "red" },
          { icon: PlayCircle, label: "In Progress", value: inProgressCount, color: "orange" },
          { icon: Archive, label: "Archived", value: archivedRequests.length, color: "slate" },
        ].map(({ icon: Icon, label, value, color }) => {
          const colors = {
            blue: { bg: "bg-blue-100 dark:bg-blue-950/30", icon: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
            red: { bg: "bg-red-100 dark:bg-red-950/30", icon: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
            orange: { bg: "bg-orange-100 dark:bg-orange-950/30", icon: "text-orange-600 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800" },
            slate: { bg: "bg-slate-100 dark:bg-slate-800", icon: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-white/10" },
          };
          const c = colors[color];
          return (
            <div key={label} className={`bg-white dark:bg-[#1F1F27] border ${c.border} rounded-2xl p-5`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "active"
              ? "bg-white dark:bg-[#1F1F27] text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Active
          {activeRequests.length > 0 && (
            <span className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold">
              {activeRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "history"
              ? "bg-white dark:bg-[#1F1F27] text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
        >
          <History className="w-4 h-4" />
          History
          {archivedRequests.length > 0 && (
            <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full font-bold">
              {archivedRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* ACTIVE TAB */}
      {activeTab === "active" && (
        <>
          {activeRequests.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wrench className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                No Active Requests
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                All clear! No active maintenance requests for this unit.
              </p>
              <Button
                onClick={() => setOpenNew(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Request
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ActiveColumn
                title="Open"
                icon={AlertCircle}
                color="red"
                requests={activeRequests.filter(r => r.status === "open")}
                onAdvanceStatus={handleAdvanceStatus}
                onArchive={null}
              />
              <ActiveColumn
                title="In Progress"
                icon={PlayCircle}
                color="orange"
                requests={activeRequests.filter(r => r.status === "in_progress")}
                onAdvanceStatus={handleAdvanceStatus}
                onArchive={null}
              />
              <ActiveColumn
                title="Resolved"
                icon={CheckCircle2}
                color="emerald"
                requests={activeRequests.filter(r => r.status === "resolved")}
                onAdvanceStatus={null}
                onArchive={handleArchive}
              />
            </div>
          )}
        </>
      )}

      {/* HISTORY TAB */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-[#1F1F27] border border-slate-200 dark:border-white/10">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search archived requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
            />
          </div>

          {/* Archived Count */}
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filteredArchived.length} archived record{filteredArchived.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>

          {filteredArchived.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10">
              <Archive className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {searchQuery ? "No results found" : "No Archived Requests"}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {searchQuery
                  ? "Try a different search term"
                  : "Resolved requests that you archive will appear here"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredArchived.map(request => (
                <Link
                  key={request._id}
                  href={`/dashboard/maintenance/${request._id}`}
                  className="flex items-start justify-between p-5 bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-4">
                    {/* Archive Icon */}
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Archive className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {request.title}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Created {new Date(request._creationTime).toLocaleDateString()}</span>
                        </div>
                        {request.archivedAt && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Archive className="w-3 h-3" />
                              <span>Archived {new Date(request.archivedAt).toLocaleDateString()}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Archived Badge */}
                  <span className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                    <CheckCircle className="w-3 h-3" />
                    Archived
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Request Dialog */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
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
                onChange={(e) => setTitle(e.target.value)}
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
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="rounded-xl border-slate-300 dark:border-white/10 min-h-[120px] resize-none"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleCreateRequest}
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
                onClick={() => setOpenNew(false)}
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

function ActiveColumn({ title, icon: Icon, color, requests, onAdvanceStatus, onArchive }) {
  const colorClasses = {
    red: { header: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800", icon: "text-red-600 dark:text-red-400", badge: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400" },
    orange: { header: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800", icon: "text-orange-600 dark:text-orange-400", badge: "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400" },
    emerald: { header: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800", icon: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" },
  };
  const c = colorClasses[color];

  return (
    <div className="space-y-4">
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

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
            No {title.toLowerCase()} requests
          </div>
        ) : (
          requests.map(request => (
            <div
              key={request._id}
              className="bg-white dark:bg-[#1F1F27] rounded-xl border border-slate-200 dark:border-white/10 p-4 hover:shadow-lg transition-all space-y-3"
            >
              <Link href={`/dashboard/maintenance/${request._id}`}>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {request.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {request.description}
                </p>
              </Link>

              {request._creationTime && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(request._creationTime).toLocaleDateString()}
                </div>
              )}

              <div className="flex flex-col gap-2 pt-1">
                {/* Advance Status Button */}
                {onAdvanceStatus && request.status !== "resolved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAdvanceStatus(request)}
                    className="w-full rounded-xl border-slate-300 dark:border-white/20"
                  >
                    {request.status === "open" ? (
                      <><PlayCircle className="w-4 h-4 mr-2" />Start Progress</>
                    ) : (
                      <><CheckCircle className="w-4 h-4 mr-2" />Mark Resolved</>
                    )}
                  </Button>
                )}

                {/* Archive Button — only on resolved */}
                {onArchive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onArchive(request)}
                    className="w-full rounded-xl border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive for Records
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}