"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";

export default function SelectRolePage() {
  const { user, isLoaded } = useUser(); // <-- use isLoaded
  const router = useRouter();
  const setRole = useMutation(api.users.setRole);

  const choose = async (role) => {
    if (!user) return; // don't run if user is not loaded
    await setRole({ clerkUserId: user.id, role });
    router.replace(role === "admin" ? "/dashboard" : "/tenant/dashboard");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-xl font-bold">Choose how you want to use the app</h1>

      <button
        className="btn"
        onClick={() => choose("admin")}
      >
        Landlord / Admin
      </button>

      <button
        className="btn"
        onClick={() => choose("tenant")}
      >
        Tenant
      </button>
    </div>
  );
}
