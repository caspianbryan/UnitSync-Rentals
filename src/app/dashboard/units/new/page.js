"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  DollarSign,
  ArrowLeft,
  Loader2,
  Building2,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function NewUnit() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = searchParams.get("propertyId");

  const [unitNumber, setUnitNumber] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch property details to show property name
  const property = useQuery(
    api.properties.getPropertyById,
    propertyId ? { propertyId } : "skip"
  );

  const createUnit = useMutation(api.units.createUnit);

  if (!propertyId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Property Not Selected
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Please select a property first
          </p>
          <Link href="/dashboard/properties">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
              Go to Properties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading property…</p>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();

    if (!unitNumber.trim()) {
      toast.error("Please enter a unit number");
      return;
    }

    if (!rentAmount || Number(rentAmount) <= 0) {
      toast.error("Please enter a valid rent amount");
      return;
    }

    setIsSubmitting(true);

    try {
      await createUnit({
        propertyId,
        unitNumber: unitNumber.trim(),
        rentAmount: Number(rentAmount),
      });

      toast.success("Unit created successfully!", {
        description: `Unit ${unitNumber} has been added to ${property.name}`
      });

      router.push(`/dashboard/properties/${propertyId}`);
    } catch (error) {
      console.error("Error creating unit:", error);
      toast.error("Failed to create unit", {
        description: "Please try again or contact support"
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back Navigation */}
      <Link
        href={`/dashboard/properties/${propertyId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to {property.name}
      </Link>

      {/* Header */}
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
          <Home className="w-8 h-8 text-white" />
        </div>

        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Add New Unit
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create a rental unit in <span className="font-semibold text-slate-900 dark:text-white">{property.name}</span>
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={submit} className="space-y-6">
        <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Unit Details
          </h2>

          <div className="space-y-6">
            {/* Unit Number */}
            <div>
              <Label htmlFor="unitNumber" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                Unit Number / Identifier *
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="unitNumber"
                  required
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  placeholder="e.g., A1, 101, Studio-B"
                  className="rounded-xl border-slate-300 dark:border-white/10 h-12 pl-11"
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter a unique identifier for this unit (apartment number, floor, etc.)
              </p>
            </div>

            {/* Rent Amount */}
            <div>
              <Label htmlFor="rentAmount" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
                Monthly Rent Amount (KES) *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="rentAmount"
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  placeholder="25000"
                  className="rounded-xl border-slate-300 dark:border-white/10 h-12 pl-11"
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The monthly rent amount for this unit in Kenyan Shillings
              </p>

              {/* Preview */}
              {rentAmount && Number(rentAmount) > 0 && (
                <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    <strong>Preview:</strong> KES {Number(rentAmount).toLocaleString()} per month
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-3">
            📋 What happens next?
          </h3>
          <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
              <span>The unit will be created and marked as vacant</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
              <span>You can assign tenants to this unit later</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
              <span>Rent amount can be updated at any time</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-14 text-base font-semibold shadow-lg shadow-emerald-600/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Unit...
              </>
            ) : (
              <>
                <Home className="w-5 h-5 mr-2" />
                Create Unit
              </>
            )}
          </Button>

          <Link href={`/dashboard/properties/${propertyId}`}>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
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