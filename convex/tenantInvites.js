import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate unique invite code
function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoid confusing chars
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ────────────────────────────────────────────────────────────
// CREATE TENANT INVITE
// ────────────────────────────────────────────────────────────

export const createTenantInvite = mutation({
  args: {
    landlordId: v.id("users"),
    propertyId: v.id("properties"),
    unitId: v.id("units"),
    email: v.string(),
    fullName: v.string(),
    phone: v.optional(v.string()),
    rentAmount: v.number(),
    moveInDate: v.number(),
    expiresInDays: v.optional(v.number()), // Default 7 days
  },
  handler: async (ctx, args) => {
    const expiresInDays = args.expiresInDays || 7;
    const expiresAt =
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000;

    // Generate unique code
    let inviteCode = generateInviteCode();

    // Ensure code is unique
    let existing = await ctx.db
      .query("tenantInvites")
      .withIndex("by_invite_code", (q) =>
        q.eq("inviteCode", inviteCode)
      )
      .first();

    while (existing) {
      inviteCode = generateInviteCode();
      existing = await ctx.db
        .query("tenantInvites")
        .withIndex("by_invite_code", (q) =>
          q.eq("inviteCode", inviteCode)
        )
        .first();
    }

    // Create invite
    const inviteId = await ctx.db.insert("tenantInvites", {
      landlordId: args.landlordId,
      propertyId: args.propertyId,
      unitId: args.unitId,
      email: args.email,
      inviteCode,
      fullName: args.fullName,
      phone: args.phone,
      rentAmount: args.rentAmount,
      moveInDate: args.moveInDate,
      status: "pending",
      sentAt: Date.now(),
      expiresAt,
    });

    return {
      inviteId,
      inviteCode,
      expiresAt,
    };
  },
});

// ────────────────────────────────────────────────────────────
// GET INVITES
// ────────────────────────────────────────────────────────────

export const getLandlordInvites = query({
  args: { landlordId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tenantInvites")
      .withIndex("by_landlord", (q) =>
        q.eq("landlordId", args.landlordId)
      )
      .collect();
  },
});