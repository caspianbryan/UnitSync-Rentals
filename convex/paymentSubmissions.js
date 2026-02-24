import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/* ── TENANT ACTIONS ────────────────────────────────────────────────────── */

// Submit payment proof
export const submitPaymentProof = mutation({
  args: {
    tenantId: v.id("tenants"),
    unitId: v.id("units"),
    landlordId: v.id("users"),
    propertyId: v.id("properties"),
    month: v.string(),
    amount: v.number(),
    method: v.union(v.literal("mpesa"), v.literal("bank"), v.literal("cash")),
    referenceNumber: v.string(),
    paidDate: v.string(),
    notes: v.optional(v.string()),
    proofImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // REMOVED: Check that blocked multiple submissions per month
    // Tenants can now submit multiple payment proofs for the same month
    // (e.g., partial payments, corrections, etc.)
    
    const submissionId = await ctx.db.insert("paymentSubmissions", {
      ...args,
      status: "pending",
      submittedAt: now,
      createdAt: now,
    });
    
    // TODO: Send notification to landlord
    
    return { submissionId, success: true };
  },
});

// Get tenant's submissions
export const getTenantSubmissions = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query("paymentSubmissions")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .order("desc")
      .collect();
    
    return submissions;
  },
});

// Cancel pending submission
export const cancelSubmission = mutation({
  args: { submissionId: v.id("paymentSubmissions") },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");
    if (submission.status !== "pending") {
      throw new Error("Can only cancel pending submissions");
    }
    
    await ctx.db.delete(args.submissionId);
    return { success: true };
  },
});

/* ── LANDLORD ACTIONS ──────────────────────────────────────────────────── */

// Get pending submissions for landlord
export const getPendingSubmissions = query({
  args: { landlordId: v.id("users") },
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query("paymentSubmissions")
      .withIndex("by_landlord_status", (q) =>
        q.eq("landlordId", args.landlordId).eq("status", "pending")
      )
      .order("desc")
      .collect();
    
    // Enrich with tenant, unit, property data
    const enriched = await Promise.all(
      submissions.map(async (sub) => {
        const tenant = await ctx.db.get(sub.tenantId);
        const unit = await ctx.db.get(sub.unitId);
        const property = await ctx.db.get(sub.propertyId);
        return { ...sub, tenant, unit, property };
      })
    );
    
    return enriched;
  },
});

// Get all submissions for landlord (with filters)
export const getLandlordSubmissions = query({
  args: {
    landlordId: v.id("users"),
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
  },
  handler: async (ctx, args) => {
    let submissions;
    
    if (args.status) {
      submissions = await ctx.db
        .query("paymentSubmissions")
        .withIndex("by_landlord_status", (q) =>
          q.eq("landlordId", args.landlordId).eq("status", args.status)
        )
        .order("desc")
        .collect();
    } else {
      submissions = await ctx.db
        .query("paymentSubmissions")
        .withIndex("by_landlord", (q) => q.eq("landlordId", args.landlordId))
        .order("desc")
        .collect();
    }
    
    // Enrich
    const enriched = await Promise.all(
      submissions.map(async (sub) => {
        const tenant = await ctx.db.get(sub.tenantId);
        const unit = await ctx.db.get(sub.unitId);
        const property = await ctx.db.get(sub.propertyId);
        return { ...sub, tenant, unit, property };
      })
    );
    
    return enriched;
  },
});

/* ── ADMIN ACTIONS (See all submissions) ───────────────────────────────── */

// Get all pending submissions across all landlords (admin only)
export const getAllPendingSubmissions = query({
  args: {},
  handler: async (ctx) => {
    const submissions = await ctx.db
      .query("paymentSubmissions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
    
    // Enrich with tenant, unit, property data
    const enriched = await Promise.all(
      submissions.map(async (sub) => {
        const tenant = await ctx.db.get(sub.tenantId);
        const unit = await ctx.db.get(sub.unitId);
        const property = await ctx.db.get(sub.propertyId);
        return { ...sub, tenant, unit, property };
      })
    );
    
    return enriched;
  },
});

// Get all submissions with filter (admin only)
export const getAllSubmissions = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
  },
  handler: async (ctx, args) => {
    let submissions;
    
    if (args.status) {
      submissions = await ctx.db
        .query("paymentSubmissions")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .order("desc")
        .collect();
    } else {
      submissions = await ctx.db
        .query("paymentSubmissions")
        .order("desc")
        .collect();
    }
    
    // Enrich
    const enriched = await Promise.all(
      submissions.map(async (sub) => {
        const tenant = await ctx.db.get(sub.tenantId);
        const unit = await ctx.db.get(sub.unitId);
        const property = await ctx.db.get(sub.propertyId);
        return { ...sub, tenant, unit, property };
      })
    );
    
    return enriched;
  },
});

// Approve submission → creates payment record
export const approveSubmission = mutation({
  args: {
    submissionId: v.id("paymentSubmissions"),
    reviewedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");
    if (submission.status !== "pending") {
      throw new Error("Submission already reviewed");
    }
    
    const now = Date.now();
    
    // Find or create ledger entry for this month
    let ledger = await ctx.db
      .query("rentLedger")
      .withIndex("by_tenant_month", (q) =>
        q.eq("tenantId", submission.tenantId).eq("month", submission.month)
      )
      .first();
    
    if (!ledger) {
      // Get unit to get rent amount
      const unit = await ctx.db.get(submission.unitId);
      if (!unit) throw new Error("Unit not found");
      
      // Create ledger entry
      const ledgerId = await ctx.db.insert("rentLedger", {
        tenantId: submission.tenantId,
        unitId: submission.unitId,
        propertyId: submission.propertyId,
        landlordId: submission.landlordId,
        month: submission.month,
        amountDue: unit.rentAmount,
        amountPaid: 0,
        status: "unpaid",
        dueDate: `${submission.month}-01`,
        createdAt: now,
      });
      ledger = await ctx.db.get(ledgerId);
    }
    
    // Create payment record
    const paymentId = await ctx.db.insert("payments", {
      tenantId: submission.tenantId,
      unitId: submission.unitId,
      landlordId: submission.landlordId,
      ledgerId: ledger._id,
      amount: submission.amount,
      method: submission.method,
      referenceNumber: submission.referenceNumber,
      paidDate: submission.paidDate,
      month: submission.month,
      notes: submission.notes,
      recordedBy: args.reviewedBy,
      createdAt: now,
    });
    
    // Update ledger amounts
    const newAmountPaid = ledger.amountPaid + submission.amount;
    let newStatus = "unpaid";
    if (newAmountPaid >= ledger.amountDue) {
      newStatus = "paid";
    } else if (newAmountPaid > 0) {
      newStatus = "partial";
    }
    
    await ctx.db.patch(ledger._id, {
      amountPaid: newAmountPaid,
      status: newStatus,
      updatedAt: now,
    });
    
    // Update submission
    await ctx.db.patch(args.submissionId, {
      status: "approved",
      reviewedAt: now,
      reviewedBy: args.reviewedBy,
      paymentId,
    });
    
    return { success: true, paymentId };
  },
});

// Reject submission
export const rejectSubmission = mutation({
  args: {
    submissionId: v.id("paymentSubmissions"),
    reviewedBy: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");
    if (submission.status !== "pending") {
      throw new Error("Submission already reviewed");
    }
    
    await ctx.db.patch(args.submissionId, {
      status: "rejected",
      reviewedAt: Date.now(),
      reviewedBy: args.reviewedBy,
      rejectionReason: args.reason,
    });
    
    return { success: true };
  },
});
