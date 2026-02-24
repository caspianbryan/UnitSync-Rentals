"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import {
  Building2,
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  MapPin,
  ArrowRight,
  Home,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wrench,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(month) {
  const [year, m] = month.split("-");
  return new Date(year, parseInt(m) - 1).toLocaleString("default", { month: "long", year: "numeric" });
}

export default function Dashboard() {
  const { user } = useUser();
  const thisMonth = currentMonth();

  const convexUser = useQuery(
    api.users.getByClerkId,
    user ? { clerkUserId: user.id } : "skip"
  );

  const properties = useQuery(
    api.properties.getLandlordProperties,
    convexUser?._id ? { landlordId: convexUser._id } : "skip"
  );

  const activeTenants = useQuery(
    api.tenants.getAllTenants,
    convexUser?._id ? { landlordId: convexUser._id } : "skip"
  );

  const allUnits = useQuery(
    api.units.getAllLandlordUnits,
    convexUser?._id ? { landlordId: convexUser._id } : "skip"
  );

  // Current month ledger for payment data
  const ledger = useQuery(
    api.payments.getLandlordLedger,
    convexUser?._id ? { landlordId: convexUser._id, month: thisMonth } : "skip"
  );

  // Maintenance stats
  const maintenanceRequests = useQuery(
    api.maintenance.getAllLandlordMaintenanceRequests,
    convexUser?._id ? { landlordId: convexUser._id } : "skip"
  );

  const pendingSubmissions = useQuery(
    api.paymentSubmissions.getPendingSubmissions,
    convexUser?.isLandlord ? { landlordId: convexUser._id } : "skip"
  );

  const pendingPaymentSubmissions = useQuery(
    api.paymentSubmissions.getAllPendingSubmissions,
    convexUser?.isAdmin ? {} : "skip"
  );

  const pendingPaymentsCount = pendingPaymentSubmissions?.length || 0;

  if (!convexUser || !properties || !activeTenants || !allUnits) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  // ─── Unit / Tenant stats ────────────────────────────────────────────────────
  const totalUnitsCount = allUnits.length;
  const occupiedUnitsCount = allUnits.filter(u => u.tenantId).length;
  const occupancyRate = totalUnitsCount > 0 ? Math.round((occupiedUnitsCount / totalUnitsCount) * 100) : 0;
  const activeTenantsCount = activeTenants.filter(t => t.unitId).length;

  // Expected monthly revenue from rent amounts
  const monthlyRevenue = allUnits
    .filter(u => u.tenantId)
    .reduce((sum, u) => sum + (u.rentAmount || 0), 0);

  // ─── Payment stats from ledger ──────────────────────────────────────────────
  const ledgerReady = Array.isArray(ledger);
  const totalCollected = ledgerReady ? ledger.reduce((s, e) => s + e.amountPaid, 0) : 0;
  const totalDue = ledgerReady ? ledger.reduce((s, e) => s + e.amountDue, 0) : monthlyRevenue;
  const outstanding = totalDue - totalCollected;
  const collectionRate = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;
  const paidCount = ledgerReady ? ledger.filter(e => e.status === "paid").length : 0;
  const overdueCount = ledgerReady ? ledger.filter(e => e.status === "overdue" || e.status === "unpaid").length : 0;

  // ─── Maintenance stats ──────────────────────────────────────────────────────
  const openMaintenance = maintenanceRequests
    ? maintenanceRequests.filter(r => r.status === "open").length
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome back, {convexUser.name || user?.firstName || "there"}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Here's your portfolio overview for {getMonthLabel(thisMonth)}
          </p>
        </div>

        <Link href="/dashboard/properties/new">
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="Properties"
          value={properties.length}
          sublabel={`${totalUnitsCount} total units`}
          color="emerald"
        />
        <StatCard
          icon={Users}
          label="Active Tenants"
          value={activeTenantsCount}
          sublabel={`${occupancyRate}% occupancy`}
          color="blue"
        />
        <StatCard
          icon={DollarSign}
          label="Expected Revenue"
          value={`KES ${monthlyRevenue.toLocaleString()}`}
          sublabel="per month"
          color="purple"
        />
        <StatCard
          icon={TrendingUp}
          label="Occupancy"
          value={`${occupancyRate}%`}
          sublabel={`${occupiedUnitsCount} of ${totalUnitsCount} units`}
          color="orange"
        />
      </div>

      {/* Payment Summary Banner */}
      <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-slate-900 dark:text-white">
              {getMonthLabel(thisMonth)} — Rent Collection
            </h2>
          </div>
          <Link href="/dashboard/rents">
            <Button variant="ghost" size="sm" className="text-emerald-600 dark:text-emerald-400 rounded-xl gap-1">
              Manage <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* ONLY show pending alert HERE if submissions > 0 */}
        {pendingSubmissions?.length > 0 && (
          <div className="p-4 border-b border-slate-200 dark:border-white/10">
            <Link href="/dashboard/payment-submissions">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors">
                <Clock className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                    {pendingSubmissions.length} payment{pendingSubmissions.length !== 1 ? 's' : ''} waiting for review
                  </p>
                  <p className="text-xs text-orange-600/70 dark:text-orange-400/70">
                    Tenants have submitted payment proofs
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-orange-500" />
              </div>
            </Link>
          </div>
        )}

        <div className="p-6">
          {!ledgerReady || ledger.length === 0 ? (
            // No ledger generated yet
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">
                  No ledger generated for this month yet.
                </p>
                <p className="text-slate-500 dark:text-slate-500 text-xs">
                  Go to Rent & Payments to generate the monthly ledger.
                </p>
              </div>
              <Link href="/dashboard/rents">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Ledger
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Collection Progress */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Collection Progress
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {collectionRate}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${collectionRate >= 80 ? "bg-emerald-500" :
                      collectionRate >= 50 ? "bg-orange-500" : "bg-red-500"
                      }`}
                    style={{ width: `${collectionRate}%` }}
                  />
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <PaymentStat
                  label="Expected"
                  value={`KES ${totalDue.toLocaleString()}`}
                  color="slate"
                />
                <PaymentStat
                  label="Collected"
                  value={`KES ${totalCollected.toLocaleString()}`}
                  color="emerald"
                />
                <PaymentStat
                  label="Outstanding"
                  value={`KES ${outstanding.toLocaleString()}`}
                  color={outstanding > 0 ? "red" : "emerald"}
                />
                <PaymentStat
                  label="Paid in Full"
                  value={`${paidCount} / ${ledger.length}`}
                  color="blue"
                />
              </div>

              {/* Alert if overdues exist */}
              {overdueCount > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-300">
                      {overdueCount} tenant{overdueCount !== 1 ? "s" : ""} have not paid this month
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                      Follow up to collect outstanding rent
                    </p>
                  </div>
                  <Link href="/dashboard/rents">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-xl whitespace-nowrap">
                      View All
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Middle Row: Properties + Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Maintenance Requests Card */}
        <MaintenanceCard openMaintenance={openMaintenance} />

        {/* Payment Submissions Card */}
        <PaymentSubmissionsCard
          pendingSubmissions={pendingPaymentSubmissions}
          pendingCount={pendingPaymentsCount}
        />
      </div>

      {/* Middle Row: Properties + Alerts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Your Properties
            </h2>
            <Link href="/dashboard/properties">
              <Button variant="ghost" size="sm" className="text-emerald-600 dark:text-emerald-400 rounded-xl gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="p-4">
            {properties.length === 0 ? (
              <div className="text-center py-10">
                <Home className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">No properties yet</p>
                <Link href="/dashboard/properties/new">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Property
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {properties.map((property) => {
                  const propertyUnits = allUnits.filter(u => u.propertyId === property._id);
                  const occupiedUnits = propertyUnits.filter(u => u.tenantId).length;
                  const propertyRevenue = propertyUnits.filter(u => u.tenantId).reduce((s, u) => s + (u.rentAmount || 0), 0);
                  const propertyOccRate = propertyUnits.length > 0 ? Math.round((occupiedUnits / propertyUnits.length) * 100) : 0;

                  // Payment status for this property from ledger
                  const propertyLedger = ledgerReady ? ledger.filter(e => e.propertyId === property._id) : [];
                  const propCollected = propertyLedger.reduce((s, e) => s + e.amountPaid, 0);
                  const propDue = propertyLedger.reduce((s, e) => s + e.amountDue, 0);
                  const propCollRate = propDue > 0 ? Math.round((propCollected / propDue) * 100) : null;

                  return (
                    <Link
                      key={property._id}
                      href={`/dashboard/properties/${property._id}`}
                      className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {property.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{property.location}</span>
                            <span>•</span>
                            <span>{propertyUnits.length} units</span>
                            <span>•</span>
                            <span>{occupiedUnits} occupied</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Collection rate badge */}
                        {propCollRate !== null && (
                          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${propCollRate >= 80
                            ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                            : propCollRate >= 50
                              ? "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400"
                              : "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                            }`}>
                            {propCollRate}% collected
                          </div>
                        )}
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            KES {propertyRevenue.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-400">/month</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>


        <div className="space-y-4">

          {/* Maintenance Alert */}
          <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 p-5">

            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="font-bold text-slate-900 dark:text-white">Maintenance</h3>
            </div>
            {openMaintenance > 0 ? (
              <>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 mb-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-orange-900 dark:text-orange-300">
                      {openMaintenance} open request{openMaintenance !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-400">Need attention</p>
                  </div>
                </div>
                <Link href="/dashboard/maintenance">
                  <Button variant="outline" size="sm" className="w-full rounded-xl border-slate-200 dark:border-white/10">
                    View Requests <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                  All clear!
                </p>
              </div>
            )}
          </div>

          {/* Vacant Units */}
          <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-white">Vacancies</h3>
            </div>
            {totalUnitsCount - occupiedUnitsCount > 0 ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {totalUnitsCount - occupiedUnitsCount}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">vacant units</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Potential monthly revenue: <strong className="text-slate-700 dark:text-slate-300">
                    KES {allUnits.filter(u => !u.tenantId).reduce((s, u) => s + (u.rentAmount || 0), 0).toLocaleString()}
                  </strong>
                </p>
                <Link href="/dashboard/properties">
                  <Button variant="outline" size="sm" className="w-full rounded-xl border-slate-200 dark:border-white/10">
                    Fill Vacancies <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                  Fully occupied!
                </p>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Add Tenant", href: "/dashboard/tenants/new", color: "text-emerald-600 dark:text-emerald-400" },
                { label: "Record Payment", href: "/dashboard/rents", color: "text-purple-600 dark:text-purple-400" },
                { label: "View Reports", href: "/dashboard/maintenance", color: "text-blue-600 dark:text-blue-400" },
              ].map(({ label, href, color }) => (
                <Link key={label} href={href}>
                  <Button variant="ghost" className={`w-full justify-between rounded-xl ${color} hover:bg-slate-50 dark:hover:bg-white/5`}>
                    {label}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sublabel, color }) {
  const colors = {
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/20", icon: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
    blue: { bg: "bg-blue-50 dark:bg-blue-950/20", icon: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
    purple: { bg: "bg-purple-50 dark:bg-purple-950/20", icon: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
    orange: { bg: "bg-orange-50 dark:bg-orange-950/20", icon: "text-orange-600 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800" },
  };
  const c = colors[color];

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} p-6 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-white/60 dark:bg-black/20`}>
          <Icon className={`w-6 h-6 ${c.icon}`} />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{sublabel}</p>
    </div>
  );
}

// ─── Payment Stat ─────────────────────────────────────────────────────────────
function PaymentStat({ label, value, color }) {
  const colors = {
    slate: "text-slate-900 dark:text-white",
    emerald: "text-emerald-600 dark:text-emerald-400",
    red: "text-red-600 dark:text-red-400",
    blue: "text-blue-600 dark:text-blue-400",
  };
  return (
    <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{label}</p>
      <p className={`text-lg font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}


function PaymentSubmissionsCard({ pendingSubmissions, pendingCount }) {
  return (
    <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Payment Submissions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tenant payment proofs
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/payment-submission"
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-white/10 border-b border-slate-200 dark:border-white/10">
        <div className="px-4 py-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{pendingCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pending</p>
        </div>
        <div className="px-4 py-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mx-auto mb-2">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {pendingSubmissions?.reduce((sum, s) => sum + s.amount, 0).toLocaleString() || 0}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total KES</p>
        </div>
        <div className="px-4 py-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center mx-auto mb-2">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {new Set(pendingSubmissions?.map(s => s.tenantId)).size || 0}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tenants</p>
        </div>
      </div>

      {/* Content */}
      {pendingCount === 0 ? (
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            All caught up!
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No pending payment submissions
          </p>
        </div>
      ) : (
        <>
          <Link href="/dashboard/payment-submission">
            <div className="p-4 m-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                    {pendingCount} payment{pendingCount !== 1 ? 's' : ''} need review
                  </p>
                  <p className="text-xs text-orange-600/70 dark:text-orange-400/70">
                    Click to review and approve
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-orange-500 flex-shrink-0" />
              </div>
            </div>
          </Link>

          {/* Recent submissions preview */}
          <div className="border-t border-slate-200 dark:border-white/10">
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Recent Pending
              </p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {pendingSubmissions?.slice(0, 3).map((submission) => (
                <Link
                  key={submission._id}
                  href="/dashboard/payment-submission"
                  className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  {/* Tenant avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {submission.tenant?.fullName.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {submission.tenant?.fullName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate">
                        {submission.property?.name} · Unit {submission.unit?.unitNumber}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      KES {submission.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      {submission.method.toUpperCase()}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


function MaintenanceCard({ openMaintenance }) {
  return (
    <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Maintenance Requests
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active issues
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/maintenance"
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-white/10 border-b border-slate-200 dark:border-white/10">
        <div className="px-4 py-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{openMaintenance}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Open</p>
        </div>
        <div className="px-4 py-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">0</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">In Progress</p>
        </div>
        <div className="px-4 py-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">0</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Resolved</p>
        </div>
      </div>

      {/* Content */}
      {openMaintenance > 0 ? (
        <div className="p-4">
          <Link href="/dashboard/maintenance">
            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                    {openMaintenance} request{openMaintenance !== 1 ? 's' : ''} need attention
                  </p>
                  <p className="text-xs text-orange-600/70 dark:text-orange-400/70">
                    Review and assign tasks
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-orange-500 flex-shrink-0" />
              </div>
            </div>
          </Link>
        </div>
      ) : (
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            All caught up!
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No open maintenance requests
          </p>
        </div>
      )}
    </div>
  );
}
