"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { 
  Home, 
  Plus, 
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  ArrowLeft,
  Edit,
  CheckCircle2,
  XCircle,
  ArrowRight,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyActions from "@/components/dashboard/PropertyActions";

export default function PropertyDetailPage() {
  const { propertyId } = useParams();

  // Fetch property details
  const property = useQuery(
    api.properties.getPropertyById,
    propertyId ? { propertyId } : "skip"
  );

  // Fetch units for this property
  const units = useQuery(
    api.units.getPropertyUnits,
    propertyId ? { propertyId } : "skip"
  );

  // Fetch tenants for this property
  const tenants = useQuery(
    api.tenants.getPropertyTenants,
    propertyId ? { propertyId } : "skip"
  );

  if (!propertyId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">No property selected</p>
        </div>
      </div>
    );
  }

  if (!property || !units || !tenants) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading property details…</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.tenantId).length;
  const vacantUnits = totalUnits - occupiedUnits;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  
  const activeTenants = tenants.filter(t => t.status === "active").length;
  const totalRevenue = units.reduce((sum, unit) => sum + (unit.rentAmount || 0), 0);
  const currentRevenue = units.filter(u => u.tenantId).reduce((sum, unit) => sum + (unit.rentAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Back Navigation */}
      <Link
        href="/dashboard/properties"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Properties
      </Link>

      {/* Property Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              {property.name}
            </h1>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <MapPin className="w-4 h-4" />
              <span>{property.location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className="rounded-xl border-slate-300 dark:border-white/20"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Property
          </Button>
          <PropertyActions propertyId={propertyId} />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Home}
          label="Total Units"
          value={totalUnits}
          sublabel={`${occupiedUnits} occupied, ${vacantUnits} vacant`}
          color="blue"
        />
        
        <MetricCard
          icon={Users}
          label="Active Tenants"
          value={activeTenants}
          sublabel={`${occupancyRate}% occupancy rate`}
          color="emerald"
          trend={occupancyRate >= 80 ? "positive" : "neutral"}
        />
        
        <MetricCard
          icon={DollarSign}
          label="Monthly Revenue"
          value={`KES ${currentRevenue.toLocaleString()}`}
          sublabel={`Potential: KES ${totalRevenue.toLocaleString()}`}
          color="purple"
        />
        
        <MetricCard
          icon={TrendingUp}
          label="Occupancy Rate"
          value={`${occupancyRate}%`}
          sublabel={occupancyRate >= 80 ? "Excellent" : "Good"}
          color="orange"
        />
      </div>

      {/* Units Section */}
      <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Units & Rentals
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Manage individual units and their occupancy
              </p>
            </div>
            <Link href={`/dashboard/units/new?propertyId=${propertyId}`}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20">
                <Plus className="w-4 h-4 mr-2" />
                Add Unit
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-6">
          {units.length === 0 ? (
            <EmptyUnits propertyId={propertyId} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {units.map((unit) => (
                <UnitCard key={unit._id} unit={unit} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tenants Section */}
      <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Tenants
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                View and manage tenants in this property
              </p>
            </div>
            <Link href={`/dashboard/tenants`}>
              <Button variant="outline" className="rounded-xl border-slate-300 dark:border-white/20">
                View All Tenants
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-6">
          {tenants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No tenants yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Add units first, then assign tenants to them
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tenants.slice(0, 5).map((tenant) => (
                <TenantRow key={tenant._id} tenant={tenant} />
              ))}
              {tenants.length > 5 && (
                <div className="pt-4 text-center">
                  <Link href={`/dashboard/tenants`}>
                    <Button variant="ghost" className="text-emerald-600 dark:text-emerald-400">
                      View all {tenants.length} tenants
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sublabel, color, trend }) {
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
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-950/30',
      icon: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800'
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-950/30',
      icon: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`bg-white dark:bg-[#1F1F27] border ${classes.border} rounded-2xl p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${classes.bg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${classes.icon}`} />
        </div>
        {trend === "positive" && (
          <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            Excellent
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
        {label}
      </p>
      <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
        {value}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {sublabel}
      </p>
    </div>
  );
}

function UnitCard({ unit }) {
  const isOccupied = !!unit.tenantId;
  
  return (
    <Link
      href={`/dashboard/units/${unit._id}`}
      className="group block p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isOccupied 
              ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
          }`}>
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Unit {unit.unitNumber}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              KES {unit.rentAmount.toLocaleString()}/mo
            </p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
      </div>

      <div className="pt-3 border-t border-slate-200 dark:border-white/10">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          isOccupied
            ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
        }`}>
          {isOccupied ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              Occupied
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3" />
              Vacant
            </>
          )}
        </span>
      </div>
    </Link>
  );
}

function TenantRow({ tenant }) {
  const unit = tenant.unit;
  
  return (
    <Link
      href={`/dashboard/tenants/${tenant._id}`}
      className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold">
          {tenant.fullName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {tenant.fullName}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {tenant.phone} • Unit {unit?.unitNumber || "—"}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          tenant.status === "active"
            ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
        }`}>
          {tenant.status}
        </span>
        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}

function EmptyUnits({ propertyId }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Home className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
        No units yet
      </h3>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
        Start by adding rental units to this property. Each unit can have its own rent amount and tenant.
      </p>
      <Link href={`/dashboard/units/new?propertyId=${propertyId}`}>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20">
          <Plus className="w-4 h-4 mr-2" />
          Add First Unit
        </Button>
      </Link>
    </div>
  );
}