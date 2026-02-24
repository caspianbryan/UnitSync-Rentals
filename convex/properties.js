import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Existing mutations and queries...
export const createProperty = mutation({
  args: {
    landlordId: v.id("users"),
    name: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("properties", args);
  },
});

// ADDED A QUERY:
export const getLandlordProperties = query({
  args: { landlordId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("properties")
      .withIndex("by_landlord", (q) => q.eq("landlordId", args.landlordId))
      .collect();
  },
});

// ADDED A QUERY:
export const getPropertyById = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    return property;
  },
});