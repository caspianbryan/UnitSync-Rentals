"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { 
  Building2, 
  MapPin, 
  Plus,
  Home,
  Users,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PropertiesPage() {
  const { user } = useUser();

  const convexUser = useQuery(
    api.users.getUserByEmail,
    user?.emailAddresses?.[0]?.emailAddress
      ? { email: user.emailAddresses[0].emailAddress }
      : "skip"
  );

  const properties = useQuery(
    api.properties.getLandlordProperties,
    convexUser?._id ? { landlordId: convexUser._id } : "skip"
  );

  const allUnits = useQuery(
    api.units.getAllLandlordUnits,
    convexUser?._id ? { landlordId: convexUser._id } : "skip"
  );

  const allTenants = useQuery(
    api.tenants.getAllTenants,
    convexUser?._id ? { landlordId: convexUser._id } : "skip"
  );

  if (!convexUser || !properties) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading properties…</p>
        </div>
      </div>
    );
  }

  // Helper function to get units for a specific property
  const getPropertyUnits = (propertyId) => {
    if (!allUnits) return [];
    return allUnits.filter(unit => unit.propertyId === propertyId);
  };

  // Helper function to get tenants for a specific property
  const getPropertyTenants = (propertyId) => {
    if (!allTenants) return [];
    return allTenants.filter(tenant => tenant.propertyId === propertyId);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Properties
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your buildings and rental units
          </p>
        </div>

        <Link href="/dashboard/properties/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20">
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      {properties.length === 0 && <EmptyState />}

      {/* Properties Grid */}
      {properties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const units = getPropertyUnits(property._id);
            const tenants = getPropertyTenants(property._id);
            const occupiedUnits = units.filter(u => u.tenantId).length;
            const totalRevenue = units.reduce((sum, unit) => sum + (unit.rentAmount || 0), 0);
            const occupancyRate = units.length > 0 ? Math.round((occupiedUnits / units.length) * 100) : 0;

            return (
              <PropertyCard
                key={property._id}
                property={property}
                totalUnits={units.length}
                occupiedUnits={occupiedUnits}
                tenantCount={tenants.length}
                revenue={totalRevenue}
                occupancyRate={occupancyRate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property, totalUnits, occupiedUnits, tenantCount, revenue, occupancyRate }) {
  return (
    <Link href={`/dashboard/properties/${property._id}`}>
      <div className="group bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {property.name}
                </h3>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{property.location}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Units */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Units</span>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {totalUnits}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {occupiedUnits} occupied
              </p>
            </div>

            {/* Tenants */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Tenants</span>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {tenantCount}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {occupancyRate}% rate
              </p>
            </div>
          </div>

          {/* Revenue */}
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Revenue</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                KES {revenue.toLocaleString()}/mo
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-white/10">
          <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-center">
            Click to view details →
          </p>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 bg-white dark:bg-[#1F1F27] rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Building2 className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
        No properties yet
      </h3>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
        Start building your rental portfolio by adding your first property. Each property can have multiple units and tenants.
      </p>
      <Link href="/dashboard/properties/new">
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20">
          <Plus className="w-4 h-4 mr-2" />
          Add First Property
        </Button>
      </Link>
    </div>
  );
}