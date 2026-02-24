"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { 
  Users, 
  Search, 
  Filter, 
  Phone, 
  Building2, 
  Home,
  ArrowRight,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Grid3x3,
  List,
  UserPlus,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TenantListPage() {
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("");

  const tenants = useQuery(api.tenants.getAllTenants);

  if (!tenants) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading tenants…</p>
        </div>
      </div>
    );
  }

  // Filter tenants based on search
  const filteredTenants = tenants.filter(tenant => 
    tenant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.property?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate statistics
  const activeCount = tenants.filter(t => t.unitId).length;
  const totalCount = tenants.length;

  if (tenants.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            No Tenants Yet
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Start building your tenant roster by adding your first tenant to track leases, payments, and maintenance requests.
          </p>
          <Link href="/dashboard/tenants/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20">
              <UserPlus className="w-5 h-5 mr-2" />
              Add First Tenant
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Tenant Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage tenant information, leases, and communication
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className="rounded-xl border-slate-300 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Link href="/dashboard/tenants/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Tenant
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          label="Total Tenants"
          value={totalCount}
          color="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Active Leases"
          value={activeCount}
          color="emerald"
        />
        <StatCard
          icon={AlertCircle}
          label="Available Units"
          value={totalCount - activeCount}
          color="orange"
        />
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Button */}
          <Button 
            variant="outline"
            className="rounded-xl border-slate-300 dark:border-white/20"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Showing {filteredTenants.length} of {totalCount} tenants
        </p>
      </div>

      {/* Tenant Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((tenant) => (
            <TenantCard key={tenant._id} tenant={tenant} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                  Tenant
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                  Contact
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                  Unit
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                  Property
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <TenantRow key={tenant._id} tenant={tenant} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredTenants.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No results found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Try adjusting your search terms
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-950/30',
      icon: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800'
    },
    emerald: {
      bg: 'bg-emerald-100 dark:bg-emerald-950/30',
      icon: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800'
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-950/30',
      icon: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`bg-white dark:bg-[#1F1F27] border ${classes.border} rounded-2xl p-6 hover:shadow-lg transition-all`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${classes.bg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${classes.icon}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function TenantCard({ tenant }) {
  return (
    <Link href={`/dashboard/tenants/${tenant._id}`}>
      <div className="group bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 p-6 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xl transition-all duration-300">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
            {tenant.fullName.charAt(0).toUpperCase()}
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {tenant.fullName}
        </h3>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {tenant.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Phone className="w-4 h-4" />
              <span>{tenant.phone}</span>
            </div>
          )}
          {tenant.email && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Mail className="w-4 h-4" />
              <span className="truncate">{tenant.email}</span>
            </div>
          )}
        </div>

        {/* Property Info */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Property
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              {tenant.property?.name || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Home className="w-4 h-4" />
              Unit
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              {tenant.unit?.unitNumber || "—"}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            tenant.unitId
              ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            {tenant.unitId ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                Active Lease
              </>
            ) : (
              <>
                <Clock className="w-3 h-3" />
                No Active Lease
              </>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}

function TenantRow({ tenant }) {
  return (
    <tr className="border-b border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
      <td className="px-6 py-4">
        <Link 
          href={`/dashboard/tenants/${tenant._id}`}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold">
            {tenant.fullName.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {tenant.fullName}
          </span>
        </Link>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          {tenant.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Phone className="w-3 h-3" />
              {tenant.phone}
            </div>
          )}
          {tenant.email && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Mail className="w-3 h-3" />
              {tenant.email}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {tenant.unit?.unitNumber || "—"}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {tenant.property?.name || "—"}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {tenant.unitId && (
            <Link
              href={`/dashboard/units/${tenant.unitId}/maintenance`}
              className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
            >
              Maintenance
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
}