"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Wrench, Plus } from "lucide-react";

export default function NewMaintenanceRequest() {
  const { user } = useUser();
  const router = useRouter();
  
  const tenant = useQuery(
    api.tenants.getTenantByEmail,
    user?.emailAddresses?.[0]?.emailAddress
      ? { email: user.emailAddresses[0].emailAddress }
      : "skip"
  );

  const createRequest = useMutation(api.maintenance.createRequest);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!tenant) {
    return <div className="p-8">Loading...</div>;
  }

  if (!tenant.unitId) {
    return (
      <div className="p-8">
        <p>No unit assigned. Please contact your landlord.</p>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createRequest({
        tenantId: tenant._id,
        unitId: tenant.unitId,
        title: title.trim(),
        description: description.trim(),
      });

      toast.success("Request submitted successfully!");
      router.push("/tenant");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit request");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-8">
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
          <Wrench className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            New Maintenance Request
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Report an issue with your unit
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 p-8 space-y-6">
        <div>
          <Label htmlFor="title" className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">
            Title *
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Leaking faucet in kitchen"
            className="rounded-xl border-slate-300 dark:border-white/10 h-12"
            required
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
            className="rounded-xl border-slate-300 dark:border-white/10 min-h-[150px]"
            required
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="rounded-xl h-12 px-6"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}