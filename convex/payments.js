import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Helper: recalculate ledger status after payment ─────────────────────────
async function recalculateLedger(ctx, ledgerId) {
  const ledger = await ctx.db.get(ledgerId);
  if (!ledger) return;

  // Sum all payments for this ledger entry
  const payments = await ctx.db
    .query("payments")
    .withIndex("by_ledger", (q) => q.eq("ledgerId", ledgerId))
    .collect();

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  // Determine status
  let status;
  if (totalPaid <= 0) {
    const today = new Date().toISOString().split("T")[0];
    status = ledger.dueDate < today ? "overdue" : "unpaid";
  } else if (totalPaid < ledger.amountDue) {
    status = "partial";
  } else {
    status = "paid";
  }

  await ctx.db.patch(ledgerId, {
    amountPaid: totalPaid,
    status,
    updatedAt: Date.now(),
  });
}

// ─── Generate monthly ledger entries for all tenants ─────────────────────────
export const generateMonthlyLedger = mutation({
  args: {
    landlordId: v.id("users"),
    month: v.string(), // "2025-02"
  },
  handler: async (ctx, args) => {
    // Get all tenants for this landlord
    const tenants = await ctx.db
      .query("tenants")
      .withIndex("by_landlord", (q) => q.eq("landlordId", args.landlordId))
      .collect();

    const created = [];

    for (const tenant of tenants) {
      if (!tenant.unitId) continue; // skip unassigned tenants

      // Check if ledger entry already exists for this month
      const existing = await ctx.db
        .query("rentLedger")
        .withIndex("by_tenant_month", (q) =>
          q.eq("tenantId", tenant._id).eq("month", args.month)
        )
        .first();

      if (existing) continue; // already generated

      const unit = await ctx.db.get(tenant.unitId);
      if (!unit) continue;

      // Create ledger entry
      const ledgerId = await ctx.db.insert("rentLedger", {
        tenantId: tenant._id,
        unitId: tenant.unitId,
        propertyId: unit.propertyId,
        landlordId: args.landlordId,
        month: args.month,
        amountDue: unit.rentAmount || 0,
        amountPaid: 0,
        status: "unpaid",
        dueDate: `${args.month}-01`, // due on 1st of month
        createdAt: Date.now(),
      });

      created.push(ledgerId);
    }

    return { created: created.length };
  },
});

// ─── Record a payment ─────────────────────────────────────────────────────────
export const recordPayment = mutation({
  args: {
    tenantId: v.id("tenants"),
    landlordId: v.id("users"),
    month: v.string(),         // "2025-02"
    amount: v.number(),
    method: v.union(
      v.literal("mpesa"),
      v.literal("bank"),
      v.literal("cash")
    ),
    referenceNumber: v.optional(v.string()),
    paidDate: v.string(),      // "2025-02-03"
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find or create ledger entry for this month
    let ledger = await ctx.db
      .query("rentLedger")
      .withIndex("by_tenant_month", (q) =>
        q.eq("tenantId", args.tenantId).eq("month", args.month)
      )
      .first();

    if (!ledger) {
      // Auto-create ledger if missing
      const tenant = await ctx.db.get(args.tenantId);
      if (!tenant?.unitId) throw new Error("Tenant has no unit assigned");

      const unit = await ctx.db.get(tenant.unitId);
      if (!unit) throw new Error("Unit not found");

      const ledgerId = await ctx.db.insert("rentLedger", {
        tenantId: args.tenantId,
        unitId: tenant.unitId,
        propertyId: unit.propertyId,
        landlordId: args.landlordId,
        month: args.month,
        amountDue: unit.rentAmount || 0,
        amountPaid: 0,
        status: "unpaid",
        dueDate: `${args.month}-01`,
        createdAt: Date.now(),
      });

      ledger = await ctx.db.get(ledgerId);
    }

    // Get unit for unitId
    const tenant = await ctx.db.get(args.tenantId);

    // Insert the payment record
    await ctx.db.insert("payments", {
      tenantId: args.tenantId,
      unitId: tenant.unitId,
      landlordId: args.landlordId,
      ledgerId: ledger._id,
      amount: args.amount,
      method: args.method,
      referenceNumber: args.referenceNumber,
      paidDate: args.paidDate,
      month: args.month,
      notes: args.notes,
      recordedBy: args.landlordId,
      createdAt: Date.now(),
    });

    // Recalculate ledger totals and status
    await recalculateLedger(ctx, ledger._id);

    return { success: true };
  },
});

// ─── Delete a payment (correction) ───────────────────────────────────────────
export const deletePayment = mutation({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Payment not found");

    await ctx.db.delete(args.paymentId);

    // Recalculate ledger after deletion
    await recalculateLedger(ctx, payment.ledgerId);

    return { success: true };
  },
});

// ─── Get ledger for a landlord (all tenants, current month) ──────────────────
export const getLandlordLedger = query({
  args: {
    landlordId: v.id("users"),
    month: v.string(),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("rentLedger")
      .withIndex("by_landlord", (q) => q.eq("landlordId", args.landlordId))
      .filter((q) => q.eq(q.field("month"), args.month))
      .collect();

    // Enrich with tenant, unit, property data
    return Promise.all(
      entries.map(async (entry) => {
        const tenant = await ctx.db.get(entry.tenantId);
        const unit = await ctx.db.get(entry.unitId);
        const property = await ctx.db.get(entry.propertyId);
        return { ...entry, tenant, unit, property };
      })
    );
  },
});

// ─── Get payment history for a tenant ────────────────────────────────────────
export const getTenantPaymentHistory = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, args) => {
    // Get all ledger entries for this tenant
    const ledgerEntries = await ctx.db
      .query("rentLedger")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();

    // Sort by month descending (newest first)
    ledgerEntries.sort((a, b) => b.month.localeCompare(a.month));

    // For each ledger entry, get its payments
    return Promise.all(
      ledgerEntries.map(async (entry) => {
        const payments = await ctx.db
          .query("payments")
          .withIndex("by_ledger", (q) => q.eq("ledgerId", entry._id))
          .collect();

        payments.sort((a, b) => b.createdAt - a.createdAt);

        return { ...entry, payments };
      })
    );
  },
});

// convex/payments.ts
export const getAllLandlordPayments = query({
  args: { landlordId: v.id("users") },
  handler: async (ctx, args) => {
    const units = await ctx.db
      .query("units")
      .withIndex("by_landlordId", (q) =>
        q.eq("landlordId", args.landlordId)
      )
      .collect();

    const unitIds = units.map(u => u._id);

    const payments = await ctx.db
      .query("payments")
      .filter(q => q.or(...unitIds.map(id => q.eq(q.field("unitId"), id))))
      .collect();

    return payments;
  },
});
