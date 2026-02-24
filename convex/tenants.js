import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* =====================================================
   INTERNAL HELPERS (DRY)
   - NOT EXPORTED
   - SAFE FOR NULLS
===================================================== */

async function fetchTenantById(ctx, tenantId) {
  const tenant = await ctx.db.get(tenantId);
  return tenant ?? null;
}

async function safeGetUnitAndProperty(ctx, tenant) {
  if (!tenant?.unitId) {
    return { unit: null, property: null };
  }

  const unit = await ctx.db.get(tenant.unitId);
  const property = unit
    ? await ctx.db.get(unit.propertyId)
    : null;

  return { unit, property };
}

async function enrichTenantWithRelations(ctx, tenant) {
  if (!tenant) return null;

  const { unit, property } =
    await safeGetUnitAndProperty(ctx, tenant);

  return {
    tenant,
    unit,
    property,
  };
}


/* =====================================================
   ADMIN MUTATIONS
===================================================== */

/**
 * ADMIN: Create a tenant and assign to a unit
 */
export const createTenant = mutation({
  args: {
    landlordId: v.id("users"),
    fullName: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    propertyId: v.id("properties"),
    unitId: v.optional(v.id("units")),
    leaseStart: v.optional(v.string()),
    leaseEnd: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tenantId = await ctx.db.insert("tenants", {
      ...args,
      status: "active",
      createdAt: Date.now(),
    });

    // If a unit is assigned, update the unit to link to this tenant
    if (args.unitId) {
      await ctx.db.patch(args.unitId, {
        tenantId: tenantId,
      });
    }

    return tenantId;
  },
});


/**
 * ADMIN: Vacate tenant (detach from unit)
 */
export const vacateTenant = mutation({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, { tenantId }) => {
    const tenant = await fetchTenantById(ctx, tenantId);
    if (!tenant) return;

    if (tenant.unitId) {
      await ctx.db.patch(tenant.unitId, {
        tenantId: null,
      });
    }

    await ctx.db.patch(tenantId, {
      status: "vacated",
      unitId: null,
      leaseEnd: new Date().toISOString().slice(0, 10),
    });
  },
});


/* =====================================================
   ADMIN QUERIES
===================================================== */

/**
 * ADMIN: Get all tenants (dashboard list)
 */
export const getAllTenants = query({
  handler: async (ctx) => {
    const tenants = await ctx.db.query("tenants").collect();

    return Promise.all(
      tenants.map(async (tenant) => {
        const { unit, property } =
          await safeGetUnitAndProperty(ctx, tenant);

        return {
          ...tenant,
          unit,
          property,
        };
      })
    );
  },
});


// ADMIN: Get all units for a landlord (for dashboard)
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


// ADMIN: Get tenants by tenants
export const getPropertyTenants = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const tenants = await ctx.db
      .query("tenants")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();

    // Enrich with unit data
    return Promise.all(
      tenants.map(async (tenant) => {
        let unit = null;
        if (tenant.unitId) {
          unit = await ctx.db.get(tenant.unitId);
        }
        return {
          ...tenant,
          unit,
        };
      })
    );
  },
});

/**
 * ADMIN: Get tenants by property
 */
export const getTenantsByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    return await ctx.db
      .query("tenants")
      .withIndex("by_property", q =>
        q.eq("propertyId", propertyId)
      )
      .collect();
  },
});

/**
 * ADMIN: Get single tenant (detail view)
 */
export const getTenant = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, { tenantId }) => {
    const tenant = await fetchTenantById(ctx, tenantId);
    return await enrichTenantWithRelations(ctx, tenant);
  },
});

/* =====================================================
   TENANT QUERIES
===================================================== */

/**
 * TENANT: Lookup tenant by email (auth bridge)
 */
export const getTenantByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("tenants")
      .withIndex("by_email", q => q.eq("email", email))
      .unique();
  },
});

/**
 * TENANT: Dashboard summary
 */
export const getTenantDashboard = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, { tenantId }) => {
    const tenant = await fetchTenantById(ctx, tenantId);
    if (!tenant) return null;

    const { unit, property } =
      await safeGetUnitAndProperty(ctx, tenant);

    const maintenance = await ctx.db
      .query("maintenanceRequests")
      .withIndex("by_tenant", q => q.eq("tenantId", tenantId))
      .collect();

    return {
      tenant,
      unit,
      property,
      maintenanceCount: maintenance.length,
      openIssues: maintenance.filter(
        m => m.status !== "resolved"
      ).length,
    };
  },
});

/**
 * TENANT: Profile page
 */
export const getTenantProfile = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, args) => {
    const tenant = await ctx.db.get(args.tenantId);
    if (!tenant) return null;

    // Get unit if assigned
    let unit = null;
    let property = null;
    if (tenant.unitId) {
      unit = await ctx.db.get(tenant.unitId);
      if (unit && unit.propertyId) {
        property = await ctx.db.get(unit.propertyId);
      }
    }

    return {
      tenant,
      unit,
      property,
    };
  },
});

// Update tenant phone number
export const updateTenantPhone = mutation({
  args: {
    tenantId: v.id("tenants"),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.tenantId, {
      phone: args.phone,
    });

    return { success: true };
  },
});
