import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const syncUser = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.string(), 
  },
  handler: async (ctx, { clerkUserId, email, name }) => {

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q =>
        q.eq("clerkUserId", clerkUserId)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      clerkUserId,
      name, 
      email,
      isAdmin: false,
      isTenant: false,
      createdAt: Date.now(),
    });
  },
});

export const setRole = mutation({
  args: { clerkUserId: v.string(), role: v.union(v.literal("admin"), v.literal("tenant")) },
  handler: async (ctx, { clerkUserId, role }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!user) return;

    await ctx.db.patch(user._id, {
      isAdmin: role === "admin",
      isTenant: role === "tenant",
    });
  },
});
