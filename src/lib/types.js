// User roles (for reference)
// "admin" | "landlord" | "tenant" | "manager" | "staff"

// Role hierarchy (for permission checks)
export const ROLE_HIERARCHY = {
  admin: 100,     // Highest permission
  manager: 50,    // Can manage multiple properties
  landlord: 40,   // Owns properties
  staff: 20,      // Support/maintenance staff
  tenant: 10,     // Lowest permission
};

// Role permissions
export const ROLE_PERMISSIONS = {
  admin: {
    canAccessAdminPanel: true,
    canManageAllUsers: true,
    canManageAllProperties: true,
    canManageAllTenants: true,
    canViewAllPayments: true,
    canManageSystemSettings: true,
  },
  landlord: {
    canAccessAdminPanel: true,  // Their own dashboard
    canManageAllUsers: false,
    canManageOwnProperties: true,
    canManageOwnTenants: true,
    canViewOwnPayments: true,
    canCreateProperties: true,
    canInviteTenants: true,
  },
  tenant: {
    canAccessTenantPortal: true,
    canViewOwnPayments: true,
    canSubmitMaintenance: true,
    canViewOwnLease: true,
  },
  manager: {
    canAccessAdminPanel: true,
    canManageAssignedProperties: true,
    canViewAssignedPayments: true,
  },
  staff: {
    canViewMaintenanceRequests: true,
    canUpdateMaintenanceStatus: true,
  },
};

// Onboarding steps
export const ONBOARDING_STEPS = {
  ROLE_SELECTION: 1,
  PERSONAL_INFO: 2,
  ROLE_SPECIFIC: 3,
  VERIFICATION: 4,
  COMPLETE: 5,
};

// Role labels
export const ROLE_LABELS = {
  admin: "Administrator",
  landlord: "Property Owner",
  tenant: "Tenant",
  manager: "Property Manager",
  staff: "Staff Member",
};

// Role descriptions
export const ROLE_DESCRIPTIONS = {
  admin: "Full system access. Manage all properties, users, and settings.",
  landlord: "Manage your properties, tenants, and collect rent.",
  tenant: "View your lease, pay rent, and submit maintenance requests.",
  manager: "Manage assigned properties on behalf of owners.",
  staff: "Handle maintenance requests and support tasks.",
};