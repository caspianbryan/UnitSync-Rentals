"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  Home,
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Search,
  Building2,
  DollarSign,
  Calendar,
  Wrench,
  UserPlus,
  LogOut,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Clock
} from "lucide-react";

export default function UnitDetailPage() {
  const { unitId } = useParams();
  const router = useRouter();

  const data = useQuery(api.units.getUnitWithProperty, unitId ? { unitId } : "skip");
  const tenants = useQuery(api.tenants.getAllTenants);

  const updateUnit = useMutation(api.units.updateUnit);
  const deleteUnit = useMutation(api.units.deleteUnit);
  const assignTenant = useMutation(api.units.assignTenant);
  const vacateTenant = useMutation(api.units.vacateTenant);

  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openAssignTenant, setOpenAssignTenant] = useState(false);
  const [openVacate, setOpenVacate] = useState(false);

  const [unitNumber, setUnitNumber] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [tenantSearch, setTenantSearch] = useState("");

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading unit details…</p>
        </div>
      </div>
    );
  }

  const { unit, property } = data;
  const isOccupied = !!unit.tenantId;

  const handleOpenEdit = () => {
    setUnitNumber(unit.unitNumber);
    setRentAmount(unit.rentAmount);
    setOpenEdit(true);
  };

  const handleUpdate = async () => {
    try {
      await updateUnit({ unitId, unitNumber, rentAmount: Number(rentAmount) });
      toast.success("Unit updated successfully");
      setOpenEdit(false);
    } catch (err) {
      toast.error("Failed to update unit");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUnit({ unitId });
      toast.success("Unit deleted successfully");
      router.push(`/dashboard/properties/${property._id}`);
    } catch (err) {
      toast.error("Failed to delete unit");
      console.error(err);
    }
  };

  const handleAssignTenant = async () => {
    if (!selectedTenantId) {
      toast.error("Please select a tenant");
      return;
    }
    try {
      await assignTenant({ unitId, tenantId: selectedTenantId });
      toast.success("Tenant assigned successfully");
      setOpenAssignTenant(false);
      setSelectedTenantId("");
      setTenantSearch("");
    } catch (err) {
      toast.error("Failed to assign tenant");
      console.error(err);
    }
  };

  const handleVacateTenant = async () => {
    try {
      await vacateTenant({ unitId });
      toast.success("Tenant vacated successfully");
      setOpenVacate(false);
    } catch (err) {
      toast.error("Failed to vacate tenant");
      console.error(err);
    }
  };

  const filteredTenants = useMemo(() => {
    if (!tenants) return [];
    return tenants
      .filter(t => !t.unitId) // Only show unassigned tenants
      .filter(t => t.fullName.toLowerCase().includes(tenantSearch.toLowerCase()))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [tenants, tenantSearch]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Back Navigation */}
      <Link
        href={`/dashboard/properties/${property._id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to {property.name}
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${isOccupied
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-600/30'
              : 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-500/30'
            }`}>
            <Home className="w-10 h-10 text-white" />
          </div>

          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Unit {unit.unitNumber}
            </h1>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Building2 className="w-4 h-4" />
              <span>{property.name}</span>
              <span className="text-slate-400">•</span>
              <MapPin className="w-4 h-4" />
              <span>{property.location}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isOccupied
            ? 'bg-emerald-100 dark:bg-emerald-950/30'
            : 'bg-slate-100 dark:bg-slate-800'
          }`}>
          {isOccupied ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">Occupied</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <span className="font-semibold text-slate-600 dark:text-slate-400">Vacant</span>
            </>
          )}
        </div>
      </div>

      {/* Key Information Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Rent Card */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Monthly Rent</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            KES {unit.rentAmount.toLocaleString()}
          </p>
        </div>

        {/* Occupancy Card */}
        <div className={`border rounded-2xl p-6 ${isOccupied
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10'
          }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOccupied
                ? 'bg-emerald-100 dark:bg-emerald-950/30'
                : 'bg-slate-200 dark:bg-slate-700'
              }`}>
              <User className={`w-5 h-5 ${isOccupied
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400'
                }`} />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Occupancy Status</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {isOccupied ? 'Occupied' : 'Available'}
          </p>
        </div>

        {/* Lease Duration Card */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Lease Status</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {unit.leaseStart && unit.leaseEnd ? 'Active' : 'N/A'}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Tenant Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Tenant Information */}
          <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Tenant Information
              </h2>
            </div>

            <div className="p-6">
              {isOccupied ? (
                <div className="space-y-6">
                  {/* Tenant Details */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-600/30">
                      {unit.tenantName?.charAt(0).toUpperCase() || 'T'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {unit.tenantName || "Tenant Name"}
                      </h3>
                      <Link
                        href={`/dashboard/tenants/${unit.tenantId}`}
                        className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        View full profile →
                      </Link>
                    </div>
                  </div>

                  {/* Lease Dates */}
                  {(unit.leaseStart || unit.leaseEnd) && (
                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
                      {unit.leaseStart && (
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Lease Start</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {new Date(unit.leaseStart).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {unit.leaseEnd && (
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Lease End</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {new Date(unit.leaseEnd).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Vacate Button */}
                  <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                    <Button
                      variant="outline"
                      onClick={() => setOpenVacate(true)}
                      className="w-full rounded-xl border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Vacate Tenant
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No Tenant Assigned
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    This unit is currently vacant and available for rent
                  </p>
                  <Button
                    onClick={() => setOpenAssignTenant(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign Tenant
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Maintenance Section */}
          <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                Maintenance
              </h2>
            </div>

            <div className="p-6">
              <Link
                href={`/dashboard/units/${unit._id}/maintenance`}
                className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      View Maintenance Requests
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Track and manage unit issues
                    </p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 rotate-180 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>

            <div className="space-y-3">
              <Button
                onClick={handleOpenEdit}
                className="w-full justify-start rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Unit Details
              </Button>

              <Button
                variant="outline"
                onClick={() => setOpenDelete(true)}
                className="w-full justify-start rounded-xl border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Unit
              </Button>
            </div>
          </div>

          {/* Alerts Card */}
          {unit.isRentOverdue && (
            <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-900 dark:text-red-300 mb-1">
                    Rent Overdue
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    This unit has outstanding rent payments
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}

      {/* Edit Unit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                <Edit className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Edit Unit Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            <div>
              <Label htmlFor="unitNumber" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                Unit Number
              </Label>
              <Input
                id="unitNumber"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="rounded-xl border-slate-300 dark:border-white/10 h-12"
              />
            </div>

            <div>
              <Label htmlFor="rentAmount" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                Rent Amount (KES)
              </Label>
              <Input
                id="rentAmount"
                type="number"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                className="rounded-xl border-slate-300 dark:border-white/10 h-12"
              />
              {rentAmount && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Preview: KES {Number(rentAmount).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleUpdate}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12"
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setOpenEdit(false)}
                className="rounded-xl h-12 px-6 border-slate-300 dark:border-white/20"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Tenant Dialog */}
      <Dialog open={openAssignTenant} onOpenChange={setOpenAssignTenant}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              Assign Tenant
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            <div>
              <Label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                Search Tenant
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Type to search..."
                  value={tenantSearch}
                  onChange={(e) => setTenantSearch(e.target.value)}
                  className="rounded-xl border-slate-300 dark:border-white/10 h-12 pl-11"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                Select Tenant
              </Label>
              <select
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">-- Select Tenant --</option>
                {filteredTenants.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.fullName}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {filteredTenants.length} available tenant{filteredTenants.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAssignTenant}
                disabled={!selectedTenantId}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12"
              >
                Assign Tenant
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setOpenAssignTenant(false);
                  setSelectedTenantId("");
                  setTenantSearch("");
                }}
                className="rounded-xl h-12 px-6 border-slate-300 dark:border-white/20"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vacate Tenant Dialog */}
      <Dialog open={openVacate} onOpenChange={setOpenVacate}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              Vacate Tenant
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to vacate <strong>{unit.tenantName}</strong> from Unit {unit.unitNumber}?
              This will mark the unit as vacant and available for rent.
            </p>

            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={handleVacateTenant}
                className="flex-1 rounded-xl h-12"
              >
                Yes, Vacate Tenant
              </Button>
              <Button
                variant="outline"
                onClick={() => setOpenVacate(false)}
                className="rounded-xl h-12 px-6 border-slate-300 dark:border-white/20"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Unit Dialog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              Delete Unit
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-6">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                ⚠️ This action cannot be undone
              </p>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to permanently delete Unit {unit.unitNumber}? All associated data will be removed.
            </p>

            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex-1 rounded-xl h-12"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Yes, Delete Unit
              </Button>
              <Button
                variant="outline"
                onClick={() => setOpenDelete(false)}
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