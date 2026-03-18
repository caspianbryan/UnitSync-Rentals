import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ────────────────────────────────────────────────────────────
// GET ONBOARDING STATUS
// ────────────────────────────────────────────────────────────
export const getOnboardingStatus = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const onboarding = await ctx.db
      .query("onboarding")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!onboarding) return null;

    const user = await ctx.db.get(onboarding.userId);

    return {
      ...onboarding,
      user,
    };
  },
});

// ────────────────────────────────────────────────────────────
// STEP 1: SELECT ROLE
// ────────────────────────────────────────────────────────────
export const selectRole = mutation({
  args: {
    clerkUserId: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("landlord"),
      v.literal("tenant")
    ),
  },
  handler: async (ctx, args) => {
    const onboarding = await ctx.db
      .query("onboarding")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!onboarding) {
      throw new Error("Onboarding record not found");
    }

    await ctx.db.patch(onboarding._id, {
      selectedRole: args.role,
      currentStep: 2,
      completedSteps: [1],
      updatedAt: Date.now(),
    });

    await ctx.db.patch(onboarding.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });

    return { success: true, nextStep: 2 };
  },
});

// ────────────────────────────────────────────────────────────
// STEP 2: PERSONAL INFO
// ────────────────────────────────────────────────────────────
export const updatePersonalInfo = mutation({
  args: {
    clerkUserId: v.string(),
    fullName: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const onboarding = await ctx.db
      .query("onboarding")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!onboarding) {
      throw new Error("Onboarding record not found");
    }

    await ctx.db.patch(onboarding._id, {
      fullName: args.fullName,
      phone: args.phone,
      currentStep: 3,
      completedSteps: [1, 2],
      updatedAt: Date.now(),
    });

    await ctx.db.patch(onboarding.userId, {
      name: args.fullName,
      phone: args.phone,
      updatedAt: Date.now(),
    });

    return { success: true, nextStep: 3 };
  },
});

// ────────────────────────────────────────────────────────────
// STEP 3: ROLE-SPECIFIC INFO (LANDLORD)
// ────────────────────────────────────────────────────────────
export const updateLandlordInfo = mutation({
  args: {
    clerkUserId: v.string(),
    companyName: v.optional(v.string()),
    numberOfProperties: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const onboarding = await ctx.db
      .query("onboarding")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!onboarding) {
      throw new Error("Onboarding record not found");
    }

    if (onboarding.selectedRole !== "landlord") {
      throw new Error("This step is only for landlords");
    }

    await ctx.db.patch(onboarding._id, {
      companyName: args.companyName,
      numberOfProperties: args.numberOfProperties,
      currentStep: 4,
      completedSteps: [1, 2, 3],
      updatedAt: Date.now(),
    });

    return { success: true, nextStep: 4 };
  },
});

// ────────────────────────────────────────────────────────────
// STEP 3: ROLE-SPECIFIC INFO (TENANT - WITH INVITE CODE)
// ────────────────────────────────────────────────────────────
export const validateInviteCode = mutation({
  args: {
    clerkUserId: v.string(),
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    const onboarding = await ctx.db
      .query("onboarding")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!onboarding) {
      throw new Error("Onboarding record not found");
    }

    const invite = await ctx.db
      .query("tenantInvites")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!invite) throw new Error("Invalid invite code");
    if (invite.status !== "pending")
      throw new Error("This invite has already been used or expired");
    if (invite.expiresAt < Date.now())
      throw new Error("This invite has expired");

    await ctx.db.patch(onboarding._id, {
      inviteCode: args.inviteCode,
      landlordId: invite.landlordId,
      propertyId: invite.propertyId,
      unitId: invite.unitId,
      currentStep: 4,
      completedSteps: [1, 2, 3],
      updatedAt: Date.now(),
    });

    await ctx.db.patch(invite._id, {
      status: "accepted",
      acceptedAt: Date.now(),
    });

    return {
      success: true,
      nextStep: 4,
      invite: {
        landlordId: invite.landlordId,
        propertyId: invite.propertyId,
        unitId: invite.unitId,
        rentAmount: invite.rentAmount,
      },
    };
  },
});

// ────────────────────────────────────────────────────────────
// COMPLETE ONBOARDING
// ────────────────────────────────────────────────────────────
export const completeOnboarding = mutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const onboarding = await ctx.db
      .query("onboarding")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!onboarding) {
      throw new Error("Onboarding record not found");
    }

    await ctx.db.patch(onboarding.userId, {
      onboardingCompleted: true,
      updatedAt: Date.now(),
    });

    if (onboarding.selectedRole === "tenant" && onboarding.unitId) {
      const userDoc = await ctx.db.get(onboarding.userId);

      await ctx.db.insert("tenants", {
        userId: onboarding.userId,
        landlordId: onboarding.landlordId,
        unitId: onboarding.unitId,
        propertyId: onboarding.propertyId,
        fullName: onboarding.fullName || "",
        email: userDoc?.email || "",
        phone: onboarding.phone,
        status: "active",
        createdAt: Date.now(),
      });

      await ctx.db.patch(onboarding.unitId, {
        tenantId: onboarding.userId,
        status: "occupied",
      });
    }

    await ctx.db.patch(onboarding._id, {
      currentStep: 5,
      completedSteps: [1, 2, 3, 4, 5],
      updatedAt: Date.now(),
    });

    await ctx.db.delete(onboarding._id);

    return { success: true, completed: true };
  },
});

// ────────────────────────────────────────────────────────────
// SKIP ONBOARDING
// ────────────────────────────────────────────────────────────
export const skipOnboarding = mutation({
  args: {
    clerkUserId: v.string(),
    role: v.union(v.literal("admin"), v.literal("landlord")),
  },
  handler: async (ctx, args) => {
    const onboarding = await ctx.db
      .query("onboarding")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!onboarding) {
      throw new Error("Onboarding record not found");
    }

    await ctx.db.patch(onboarding.userId, {
      role: args.role,
      onboardingCompleted: true,
      updatedAt: Date.now(),
    });

    await ctx.db.delete(onboarding._id);

    return { success: true };
  },
});