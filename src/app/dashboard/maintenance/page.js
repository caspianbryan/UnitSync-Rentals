"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import Link from "next/link";
import {
  Wrench,
  AlertCircle,
  PlayCircle,
  CheckCircle2,
  Circle,
  Building2,
  Home,
  Calendar,
  Filter,
  Search,
  TrendingUp,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MaintenanceDashboard() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'open', 'in_progress', 'resolved'

  const convexUser = useQuery(
    api.users.getByClerkId,
    user ? { clerkUserId: user.id } : "skip"
  );

  // Get all maintenance requests for the landlord
  const allRequests = useQuery(
    api.maintenance.getAllLandlordMaintenanceRequests,
    convexUser?._id ? { landlordId: convexUser._id } : "skip"
  );

  if (!convexUser || !allRequests) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading maintenance requests…</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalRequests = allRequests.length;
  const openCount = allRequests.filter(r => r.status === "open").length;
  const inProgressCount = allRequests.filter(r => r.status === "in_progress").length;
  const resolvedCount = allRequests.filter(r => r.status === "resolved").length;

  // Filter requests
  const filteredRequests = allRequests.filter(request => {
    // Status filter
    if (statusFilter !== "all" && request.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        request.title?.toLowerCase().includes(searchLower) ||
        request.description?.toLowerCase().includes(searchLower) ||
        request.property?.name?.toLowerCase().includes(searchLower) ||
        request.unit?.unitNumber?.toLowerCase().includes(searchLower) ||
        request.tenant?.fullName?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Maintenance Requests
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track and manage maintenance across all your properties
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={Circle}
          label="Total Requests"
          value={totalRequests}
          color="blue"
          onClick={() => setStatusFilter("all")}
        />
        <StatCard
          icon={AlertCircle}
          label="Open"
          value={openCount}
          color="red"
          onClick={() => setStatusFilter("open")}
        />
        <StatCard
          icon={PlayCircle}
          label="In Progress"
          value={inProgressCount}
          color="orange"
          onClick={() => setStatusFilter("in_progress")}
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolved"
          value={resolvedCount}
          color="emerald"
          onClick={() => setStatusFilter("resolved")}
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
              placeholder="Search by title, property, unit, or tenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Showing {filteredRequests.length} of {totalRequests} requests
        </p>
        {statusFilter !== "all" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="text-emerald-600 dark:text-emerald-400"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Requests Display */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10">
          <Wrench className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            {searchQuery || statusFilter !== "all" ? "No results found" : "No Maintenance Requests"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "All clear! There are currently no maintenance requests."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Open Column */}
          <StatusColumn
            title="Open"
            icon={AlertCircle}
            color="red"
            requests={filteredRequests.filter(r => r.status === "open")}
          />

          {/* In Progress Column */}
          <StatusColumn
            title="In Progress"
            icon={PlayCircle}
            color="orange"
            requests={filteredRequests.filter(r => r.status === "in_progress")}
          />

          {/* Resolved Column */}
          <StatusColumn
            title="Resolved"
            icon={CheckCircle2}
            color="emerald"
            requests={filteredRequests.filter(r => r.status === "resolved")}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, onClick }) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-950/30',
      icon: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800'
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-950/30',
      icon: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800'
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-950/30',
      icon: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800'
    },
    emerald: {
      bg: 'bg-emerald-100 dark:bg-emerald-950/30',
      icon: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800'
    }
  };

  const classes = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className={`bg-white dark:bg-[#1F1F27] border ${classes.border} rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer text-left w-full`}
    >
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
    </button>
  );
}

function StatusColumn({ title, icon: Icon, color, requests }) {
  const colorClasses = {
    red: {
      header: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      badge: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
    },
    orange: {
      header: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
      icon: 'text-orange-600 dark:text-orange-400',
      badge: 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'
    },
    emerald: {
      header: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800',
      icon: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className="space-y-4">
      {/* Column Header */}
      <div className={`${classes.header} border rounded-2xl p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${classes.icon}`} />
            <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${classes.badge}`}>
            {requests.length}
          </span>
        </div>
      </div>

      {/* Request Cards */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
            No {title.toLowerCase()} requests
          </div>
        ) : (
          requests.map((request) => (
            <RequestCard key={request._id} request={request} />
          ))
        )}
      </div>
    </div>
  );
}

function RequestCard({ request }) {
  return (
    <Link
      href={`/dashboard/units/${request.unitId}/maintenance`}
      className="block bg-white dark:bg-[#1F1F27] rounded-xl border border-slate-200 dark:border-white/10 p-4 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
    >
      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
        {request.title}
      </h4>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
        {request.description}
      </p>

      {/* Property and Unit Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Building2 className="w-3 h-3" />
          <span>{request.property?.name || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Home className="w-3 h-3" />
          <span>Unit {request.unit?.unitNumber || "—"}</span>
        </div>
      </div>

      {/* Date */}
      {request._creationTime && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-white/10">
          <Calendar className="w-3 h-3" />
          {new Date(request._creationTime).toLocaleDateString()}
        </div>
      )}
    </Link>
  );
}

