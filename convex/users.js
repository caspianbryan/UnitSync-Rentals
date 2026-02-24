import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get user by Clerk ID
export const getByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();
    
    return user;
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    return user;
  },
});

// Complete onboarding and set role
export const completeOnboarding = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("landlord"), v.literal("tenant")),
  },
  handler: async (ctx, args) => {
    const { userId, role } = args;

    if (role === "landlord") {
      // Set as admin/landlord
      await ctx.db.patch(userId, {
        isAdmin: true,
        isTenant: false,
      });
    } else {
      // Set as tenant
      await ctx.db.patch(userId, {
        isAdmin: false,
        isTenant: true,
      });
    }

    return { success: true };
  },
});

// Sync user from Clerk (called automatically on login)
export const syncUser = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (existing) {
      // Update existing user if needed
      if (existing.email !== args.email || (args.name && existing.name !== args.name)) {
        await ctx.db.patch(existing._id, {
          email: args.email,
          ...(args.name && { name: args.name }),
        });
      }
      return existing._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      email: args.email,
      name: args.name || args.email.split("@")[0],
      isAdmin: false,
      isTenant: false,
      createdAt: Date.now(),
    });

    return userId;
  },
});

export const switchRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("landlord"), v.literal("tenant")),
  },
  handler: async (ctx, args) => {
    const { userId, role } = args;

    if (role === "landlord") {
      // Switch to landlord (admin)
      await ctx.db.patch(userId, {
        isAdmin: true,
        isTenant: false,
      });
    } else {
      // Switch to tenant
      await ctx.db.patch(userId, {
        isAdmin: false,
        isTenant: true,
      });
    }

    return { success: true, role };
  },
});