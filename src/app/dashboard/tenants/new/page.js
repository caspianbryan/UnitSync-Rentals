"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  UserPlus, 
  Building2,
  Home,
  Calendar,
  Phone,
  Mail,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function NewTenantPage() {
  const { user } = useUser();
  const router = useRouter();
  
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

  const createTenant = useMutation(api.tenants.createTenant);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    propertyId: "",
    unitId: "",
    leaseStart: "",
    leaseEnd: "",
  });

  // Get units for selected property
  const units = useQuery(
    api.units.getPropertyUnits,
    formData.propertyId ? { propertyId: formData.propertyId } : "skip"
  );

  if (!convexUser || !properties) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.propertyId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const tenantData = {
        landlordId: convexUser._id,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        propertyId: formData.propertyId,
        unitId: formData.unitId || undefined,
        leaseStart: formData.leaseStart || undefined,
        leaseEnd: formData.leaseEnd || undefined,
      };

      await createTenant(tenantData);

      toast.success("Tenant created successfully!", {
        description: "The tenant has been added to your system"
      });

      router.push("/dashboard/tenants");
    } catch (error) {
      console.error("Error creating tenant:", error);
      toast.error("Failed to create tenant", {
        description: "Please try again or contact support"
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Navigation */}
      <Link
        href="/dashboard/tenants"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Tenants
      </Link>

      {/* Header */}
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Add New Tenant
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Enter tenant information and lease details
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Personal Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fullName" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                Full Name *
              </Label>
              <Input
                id="fullName"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
                className="rounded-xl border-slate-300 dark:border-white/10 h-12"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                Phone Number *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="rounded-xl border-slate-300 dark:border-white/10 h-12 pl-11"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                Email Address (Optional)
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="rounded-xl border-slate-300 dark:border-white/10 h-12 pl-11"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Property & Unit Assignment */}
        <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Property & Unit Assignment
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="property" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                Property *
              </Label>
              <select
                id="property"
                required
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value, unitId: "" })}
                className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">Select a property</option>
                {properties.map((property) => (
                  <option key={property._id} value={property._id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="unit" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                Unit (Optional)
              </Label>
              <select
                id="unit"
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                disabled={!formData.propertyId}
                className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">No unit assigned</option>
                {units?.map((unit) => (
                  <option key={unit._id} value={unit._id}>
                    Unit {unit.unitNumber} - KES {unit.rentAmount.toLocaleString()}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You can assign a unit later if needed
              </p>
            </div>
          </div>
        </div>

        {/* Lease Information */}
        <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Lease Information (Optional)
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="leaseStart" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                Lease Start Date
              </Label>
              <Input
                id="leaseStart"
                type="date"
                value={formData.leaseStart}
                onChange={(e) => setFormData({ ...formData, leaseStart: e.target.value })}
                className="rounded-xl border-slate-300 dark:border-white/10 h-12"
              />
            </div>

            <div>
              <Label htmlFor="leaseEnd" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                Lease End Date
              </Label>
              <Input
                id="leaseEnd"
                type="date"
                value={formData.leaseEnd}
                onChange={(e) => setFormData({ ...formData, leaseEnd: e.target.value })}
                className="rounded-xl border-slate-300 dark:border-white/10 h-12"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-14 text-base font-semibold shadow-lg shadow-emerald-600/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Tenant...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Create Tenant
              </>
            )}
          </Button>

          <Link href="/dashboard/tenants">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl h-14 px-8 border-slate-300 dark:border-white/20"
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}