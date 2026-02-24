import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUnit = mutation({
  args: {
    propertyId: v.id("properties"),
    unitNumber: v.string(),
    rentAmount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("units", args);
  },
});

export const assignTenant = mutation({
  args: { 
    unitId: v.id("units"), 
    tenantId: v.id("tenants") 
  },
  handler: async (ctx, { unitId, tenantId }) => {
    return await ctx.db.patch(unitId, { tenantId });
  },
});

export const vacateTenant = mutation({
  args: { 
    unitId: v.id("units") 
  },
  handler: async (ctx, { unitId }) => {
    return await ctx.db.patch(unitId, { tenantId: null });
  },
});

export const updateUnit = mutation({
  args: { unitId: v.id("units"), unitNumber: v.string(), rentAmount: v.number() },
  handler: async (ctx, { unitId, unitNumber, rentAmount }) => {
    return await ctx.db.patch(unitId, { unitNumber, rentAmount });
  },
});

export const deleteUnit = mutation({
  args: { unitId: v.id("units") },
  handler: async (ctx, { unitId }) => {
    return await ctx.db.delete(unitId);
  },
});

export const getPropertyUnits = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("units")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();
  },
});

export const getUnitWithProperty = query({
  args: { unitId: v.id("units") },
  handler: async (ctx, { unitId }) => {
    const unit = await ctx.db.get(unitId);
    if (!unit) return null;

    const property = await ctx.db.get(unit.propertyId);
    if (!property) return null;

    return { unit, property };
  },
});

// NEW QUERY: Get all units for a landlord across all their properties
export const getAllLandlordUnits = query({
  args: { landlordId: v.id("users") },
  handler: async (ctx, args) => {
    // Get all properties for this landlord
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_landlord", (q) => q.eq("landlordId", args.landlordId))
      .collect();

    const propertyIds = properties.map(p => p._id);

    // Get all units for these properties
    const allUnits = [];
    for (const propertyId of propertyIds) {
      const units = await ctx.db
        .query("units")
        .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
        .collect();
      allUnits.push(...units);
    }

    return allUnits;
  },
});