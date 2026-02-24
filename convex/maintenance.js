import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get maintenance request by ID with enriched data
export const getById = query({
  args: { requestId: v.id("maintenanceRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return null;

    // Enrich with related data
    const property = await ctx.db.get(request.propertyId);
    const unit = await ctx.db.get(request.unitId);
    const tenant = await ctx.db.get(request.tenantId);

    return {
      ...request,
      property,
      unit,
      tenant,
    };
  },
});

// Get all maintenance requests for a landlord (across all properties)
export const getAllLandlordMaintenanceRequests = query({
  args: { landlordId: v.id("users") },
  handler: async (ctx, args) => {
    // Get all properties for this landlord
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_landlord", (q) => q.eq("landlordId", args.landlordId))
      .collect();

    const propertyIds = properties.map(p => p._id);

    // Get all maintenance requests for these properties
    const allRequests = [];
    for (const propertyId of propertyIds) {
      const requests = await ctx.db
        .query("maintenanceRequests")
        .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
        .collect();
      allRequests.push(...requests);
    }

    // Enrich with property, unit, and tenant data
    return Promise.all(
      allRequests.map(async (request) => {
        const property = await ctx.db.get(request.propertyId);
        const unit = await ctx.db.get(request.unitId);
        const tenant = await ctx.db.get(request.tenantId);

        return {
          ...request,
          property,
          unit,
          tenant,
        };
      })
    );
  },
});

// Get maintenance requests for a specific property
export const getPropertyMaintenanceRequests = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("maintenanceRequests")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();

    return requests;
  },
});

// Get maintenance requests for a specific unit
export const getRequestsForUnit = query({
  args: { unitId: v.id("units") },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("maintenanceRequests")
      .withIndex("by_unit", (q) => q.eq("unitId", args.unitId))
      .collect();

    return requests;
  },
});

// Get maintenance requests for landlord (legacy - use getAllLandlordMaintenanceRequests instead)
export const getRequestsForLandlord = query({
  args: { landlordId: v.id("users") },
  handler: async (ctx, args) => {
    // Get all properties for this landlord
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_landlord", (q) => q.eq("landlordId", args.landlordId))
      .collect();

    const propertyIds = properties.map(p => p._id);

    // Get all maintenance requests for these properties
    const allRequests = [];
    for (const propertyId of propertyIds) {
      const requests = await ctx.db
        .query("maintenanceRequests")
        .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
        .collect();
      allRequests.push(...requests);
    }

    return allRequests;
  },
});

// Create a maintenance request
export const createRequest = mutation({
  args: {
    tenantId: v.id("tenants"),
    unitId: v.id("units"),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the unit to find the propertyId
    const unit = await ctx.db.get(args.unitId);
    if (!unit) {
      throw new Error("Unit not found");
    }

    const requestId = await ctx.db.insert("maintenanceRequests", {
      tenantId: args.tenantId,
      unitId: args.unitId,
      propertyId: unit.propertyId,
      title: args.title,
      description: args.description,
      status: "open",
      createdAt: Date.now(),
    });

    return requestId;
  },
});

// Update maintenance request status
export const updateStatus = mutation({
  args: {
    requestId: v.id("maintenanceRequests"),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});



// ===================================
// convex/comments.js - New File
// ===================================

// Get comments for a maintenance request
export const getByRequest = query({
  args: { requestId: v.id("maintenanceRequests") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("maintenanceComments")
      .withIndex("by_request", (q) => q.eq("requestId", args.requestId))
      .order("asc")
      .collect();

    return comments;
  },
});

// Add a comment to a maintenance request
export const addComment = mutation({
  args: {
    requestId: v.id("maintenanceRequests"),
    authorType: v.union(v.literal("landlord"), v.literal("tenant")),
    authorId: v.id("users"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("maintenanceComments", {
      requestId: args.requestId,
      authorType: args.authorType,
      authorId: args.authorId,
      message: args.message,
      createdAt: Date.now(),
    });

    return commentId;
  },
});

// Get maintenance requests for a specific tenant
export const getRequestsForTenant = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("maintenanceRequests")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();

    // Sort by creation time (newest first)
    return requests.sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Archive a resolved maintenance request
export const archiveRequest = mutation({
  args: {
    requestId: v.id("maintenanceRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    await ctx.db.patch(args.requestId, {
      status: "archived",
      archivedAt: Date.now(),
    });

    return { success: true };
  },
});