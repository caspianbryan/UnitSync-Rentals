import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get user by Clerk ID
export const getByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

      return user;

    } catch (error) {
      console.error("Error fetching user by Clerk ID:", error);
      return null;  
    }
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getIdentity();

      if (!identity) {
        return null;
      } 

      const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.id))
      .first();
      return user ?? null;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  },
});


export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    return user;
  },
});

// Complete onboarding and set role
export const completeOnboarding = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("landlord"), v.literal("tenant")),
  },
  handler: async (ctx, args) => {
    const { userId, role } = args;

    if (role === "landlord") {
      // Set as admin/landlord
      await ctx.db.patch(userId, {
        isAdmin: true,
        isTenant: false,
      });
    } else {
      // Set as tenant
      await ctx.db.patch(userId, {
        isAdmin: false,
        isTenant: true,
      });
    }

    return { success: true };
  },
});

// Sync user from Clerk (called automatically on login)
export const syncUser = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      console.log("🔄 syncUser:", args.email);
      
      // Check if user exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
        .first();

      if (existingUser) {
        console.log("✅ User exists, updating");
        
        // Update existing user
        await ctx.db.patch(existingUser._id, {
          name: args.name,
          phone: args.phone,
          lastLoginAt: Date.now(),
        });
        
        // Return updated user
        const updatedUser = await ctx.db.get(existingUser._id);
        return updatedUser;
      }

      console.log("🆕 Creating new user");
      
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkUserId: args.clerkUserId,
        email: args.email,
        name: args.name,
        phone: args.phone,
        role: undefined,
        onboardingCompleted: false,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      });

      console.log("📝 Creating onboarding record");
      
      // Create onboarding record
      await ctx.db.insert("onboarding", {
        userId,
        clerkUserId: args.clerkUserId,
        fullName: args.name,
        phone: args.phone,
        currentStep: 1,
        completedSteps: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Return new user
      const newUser = await ctx.db.get(userId);
      console.log("✅ User created successfully");
      
      return newUser;
      
    } catch (error) {
      console.error("❌ Error in syncUser:", error);
      throw error;
    }
  },
});


export const switchRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("landlord"), v.literal("tenant")),
  },
  handler: async (ctx, args) => {
    const { userId, role } = args;

    if (role === "landlord") {
      // Switch to landlord (admin)
      await ctx.db.patch(userId, {
        isAdmin: true,
        isTenant: false,
      });
    } else {
      // Switch to tenant
      await ctx.db.patch(userId, {
        isAdmin: false,
        isTenant: true,
      });
    }

    return { success: true, role };
  },
});

// ────────────────────────────────────────────────────────────
// USER MANAGEMENT
// ────────────────────────────────────────────────────────────
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    
    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    return userId;
  },
});
