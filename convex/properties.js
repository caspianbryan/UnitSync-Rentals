import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new property for a landlord
 * @param landlordId - ID of the landlord owning the property
 * @param name - Name/title of the property
 * @param location - Address or location of the property
 * @returns The ID of the newly created property
 */
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


/**
 * Get all properties owned by a specific landlord
 * @param landlordId - ID of the landlord
 * @returns Array of property objects for the landlord
 */
export const getLandlordProperties = query({
  args: { landlordId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("properties")
      .withIndex("by_landlord", (q) => q.eq("landlordId", args.landlordId))
      .collect();
  },
});


/**
 * Get a specific property by its ID
 * @param propertyId - ID of the property to retrieve
 * @returns Property object or null if not found
 */
export const getPropertyById = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    return property;
  },
});