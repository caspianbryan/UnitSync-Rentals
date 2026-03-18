import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    name: v.string(),
    
    // NEW: Role field (replaces booleans)
    role: v.optional(v.union(  // ✅ Make optional for backward compatibility
      v.literal("admin"),
      v.literal("landlord"),
      v.literal("tenant"),
      v.literal("manager"),
      v.literal("staff")
    )),
    
    // OLD: Keep these temporarily for migration
    isAdmin: v.optional(v.boolean()),
    isLandlord: v.optional(v.boolean()),
    isTenant: v.optional(v.boolean()),
    
    // Onboarding (optional for existing users)
    onboardingCompleted: v.optional(v.boolean()), // ✅ FIXED: Made optional
    onboardingStep: v.optional(v.number()),
    
    // Profile
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_clerk_id", ["clerkUserId"])
    .index("by_email", ["email"]),

  // Onboarding data (temporary storage during onboarding)
  onboarding: defineTable({
    userId: v.id("users"),
    clerkUserId: v.string(),
    
    selectedRole: v.optional(v.union(
      v.literal("admin"),
      v.literal("landlord"),
      v.literal("tenant")
    )),
    
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    companyName: v.optional(v.string()),
    numberOfProperties: v.optional(v.number()),
    
    inviteCode: v.optional(v.string()),
    landlordId: v.optional(v.id("users")),
    propertyId: v.optional(v.id("properties")),
    unitId: v.optional(v.id("units")),
    
    currentStep: v.number(),
    completedSteps: v.array(v.number()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_clerk_id", ["clerkUserId"])
    .index("by_invite_code", ["inviteCode"]),



  properties: defineTable({
    landlordId: v.id("users"), // References users table
    name: v.string(),
    location: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_landlord", ["landlordId"]),

  units: defineTable({
    propertyId: v.id("properties"),
    landlordId: v.id("users"),
    unitNumber: v.string(),
    rentAmount: v.number(),
    tenantId: v.optional(v.id("tenants")), // References tenants table
    status: v.union(v.literal("vacant"), v.literal("occupied")),
    createdAt: v.number(),
  })
    .index("by_property", ["propertyId"])
    .index("by_landlord", ["landlordId"])
    .index("by_tenant", ["tenantId"]),

  // Tenant invites (landlord sends invite to tenant)
  tenantInvites: defineTable({
    landlordId: v.id("users"),
    propertyId: v.id("properties"),
    unitId: v.id("units"),
    
    email: v.string(),
    inviteCode: v.string(),
    fullName: v.string(),
    phone: v.optional(v.string()),
    
    rentAmount: v.number(),
    moveInDate: v.number(),
    
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired"),
      v.literal("revoked")
    ),
    
    sentAt: v.number(),
    acceptedAt: v.optional(v.number()),
    expiresAt: v.number(),
  })
    .index("by_landlord", ["landlordId"])
    .index("by_email", ["email"])
    .index("by_invite_code", ["inviteCode"])
    .index("by_status", ["status"]),

  tenants: defineTable({
    userId: v.optional(v.id("users")),
    fullName: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    unitId: v.optional(v.id("units")),
    propertyId: v.id("properties"),
    landlordId: v.id("users"),
    leaseStart: v.optional(v.string()),
    leaseEnd: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("vacated")),
    createdAt: v.number(),
    authUserId: v.optional(v.string()), // Clerk user ID for tenant login
  })
    .index("by_property", ["propertyId"])
    .index("by_email", ["email"])
    .index("by_authUserId", ["authUserId"])
    .index("by_landlord", ["landlordId"]),

  maintenanceRequests: defineTable({
    tenantId: v.id("tenants"),
    unitId: v.id("units"),
    propertyId: v.id("properties"),
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("archived")
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    archivedAt: v.optional(v.number()),
  })
    .index("by_unit", ["unitId"])
    .index("by_property", ["propertyId"])
    .index("by_tenant", ["tenantId"])
    .index("by_status", ["status"]),

  // NEW TABLE: Comments for maintenance requests
  maintenanceComments: defineTable({
    requestId: v.id("maintenanceRequests"),
    authorType: v.union(v.literal("landlord"), v.literal("tenant")),
    authorId: v.union(v.id("users"), v.id("tenants")),
    message: v.string(),
    createdAt: v.number(),
  })
    .index("by_request", ["requestId"])
    .index("by_author", ["authorId"]),


  // Monthly rent ledger - one record per tenant per month
  rentLedger: defineTable({
    tenantId: v.id("tenants"),
    unitId: v.id("units"),
    propertyId: v.id("properties"),
    landlordId: v.id("users"),
    month: v.string(),           // "2025-02" format
    amountDue: v.number(),       // rent amount for that month
    amountPaid: v.number(),      // total paid so far
    status: v.union(
      v.literal("unpaid"),
      v.literal("partial"),
      v.literal("paid"),
      v.literal("overdue")
    ),
    dueDate: v.string(),         // "2025-02-01"
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_landlord", ["landlordId"])
    .index("by_tenant_month", ["tenantId", "month"])
    .index("by_status", ["status"]),

  // Individual payment records
  payments: defineTable({
    tenantId: v.id("tenants"),
    unitId: v.id("units"),
    propertyId: v.id("properties"),
    landlordId: v.id("users"),
    ledgerId: v.id("rentLedger"),  // which month this payment is for
    amount: v.number(),
    method: v.union(
      v.literal("mpesa"),
      v.literal("bank"),
      v.literal("cash")
    ),
    referenceNumber: v.optional(v.string()), // Mpesa code / bank ref / receipt no
    paidDate: v.string(),          // "2025-02-03"
    month: v.string(),             // "2025-02"
    notes: v.optional(v.string()),
    recordedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_landlord", ["landlordId"])
    .index("by_ledger", ["ledgerId"])
    .index("by_tenant_month", ["tenantId", "month"]),

  paymentSubmissions: defineTable({
    tenantId: v.id("tenants"),
    unitId: v.id("units"),
    landlordId: v.id("users"),
    propertyId: v.id("properties"),

    // Payment details
    month: v.string(),              // "2025-02"
    amount: v.number(),
    method: v.union(
      v.literal("mpesa"),
      v.literal("bank"),
      v.literal("cash")
    ),
    referenceNumber: v.string(),
    paidDate: v.string(),           // "2025-02-03"
    notes: v.optional(v.string()),

    // Proof attachment
    proofImageUrl: v.optional(v.string()),  // Screenshot/receipt upload

    // Verification status
    status: v.union(
      v.literal("pending"),         // Waiting for landlord review
      v.literal("approved"),        // Landlord approved → payment created
      v.literal("rejected")         // Landlord rejected
    ),

    // Review details
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    rejectionReason: v.optional(v.string()),
    paymentId: v.optional(v.id("payments")),  // If approved, link to created payment

    // Timestamps
    submittedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_landlord", ["landlordId"])
    .index("by_status", ["status"])
    .index("by_tenant_month", ["tenantId", "month"])
    .index("by_landlord_status", ["landlordId", "status"]),
});


