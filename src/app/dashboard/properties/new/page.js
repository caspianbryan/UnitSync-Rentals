"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  MapPin, 
  ArrowLeft, 
  Home,
  Save,
  Loader2,
  Sparkles,
  CheckCircle2,
  Users,
  Wrench,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function NewProperty() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  const convexUser = useQuery(
    api.users.getUserByEmail,
    user?.emailAddresses?.[0]?.emailAddress
      ? { email: user.emailAddresses[0].emailAddress }
      : "skip"
  );

  const createProperty = useMutation(api.properties.createProperty);

  if (!convexUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Preparing your workspace…</p>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !location.trim()) {
      toast.error("Please fill in all required fields", {
        description: "Both property name and location are required to continue."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createProperty({
        landlordId: convexUser._id,
        name: name.trim(),
        location: location.trim(),
      });
      
      toast.success("Property created successfully!", {
        description: "Your property is now ready to manage."
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating property:", error);
      toast.error("Failed to create property", {
        description: "Please try again or contact support if the issue persists."
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-[1fr,400px] gap-8">
        {/* Main Content */}
        <div>
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                    Add New Property
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                    Step 1 of 3
                  </span>
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Create a new property and start managing tenants, maintenance, and payments in one place
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold shadow-lg shadow-emerald-600/30">
                  1
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Property Details</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Basic information</p>
                </div>
              </div>

              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10"></div>

              <div className="flex items-center gap-3 flex-1 opacity-50">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Units & Amenities</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Coming next</p>
                </div>
              </div>

              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10"></div>

              <div className="flex items-center gap-3 flex-1 opacity-50">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Review & Launch</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Final step</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Property Information
                </h2>
              </div>

              <form onSubmit={submit} className="space-y-8">
                {/* Property Name Field */}
                <div className="space-y-3">
                  <label 
                    htmlFor="property-name" 
                    className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Property Name
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="property-name"
                    type="text"
                    className="w-full px-5 py-4 text-lg rounded-xl border-2 border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="e.g., Sunset Luxury Apartments"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                    Choose a distinctive name that reflects your property's character
                  </p>
                </div>

                {/* Location Field */}
                <div className="space-y-3">
                  <label 
                    htmlFor="location" 
                    className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Location
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="location"
                    type="text"
                    className="w-full px-5 py-4 text-lg rounded-xl border-2 border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="e.g., 123 Main Street, New York, NY 10001"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                    Provide the complete address for accurate property identification
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200 dark:border-white/10">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !name.trim() || !location.trim()}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl h-14 text-lg font-semibold shadow-lg shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Property...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Create Property
                      </>
                    )}
                  </Button>

                  <Link href="/dashboard" className="flex-1 sm:flex-none">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      className="w-full rounded-xl h-14 px-8 text-lg border-2 border-slate-300 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Overview Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                What You'll Get
              </h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Centralized property dashboard with real-time insights</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Automated tenant management and communication tools</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Maintenance request tracking and resolution workflow</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Integrated rent collection and financial reporting</span>
              </li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              After Creating Your Property
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                    Add Tenants
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Onboard existing tenants and manage lease agreements
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                    Set Up Maintenance
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Configure maintenance categories and workflows
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                    Configure Payments
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Set up rent amounts and payment schedules
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/10 p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              💼 Need Help?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Our property management experts are here to guide you through the setup process.
            </p>
            <Button 
              variant="outline" 
              className="w-full rounded-xl border-slate-300 dark:border-white/20 hover:bg-white dark:hover:bg-slate-700"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}