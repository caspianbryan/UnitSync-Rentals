import { ROLE_HIERARCHY, ROLE_PERMISSIONS } from "./types";

/**
 * Check if a role has at least the minimum required permission level
 */
export function hasMinimumRole(userRole, requiredRole) {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user can access dashboard
 */
export function canAccessDashboard(role) {
  return ["admin", "landlord", "manager"].includes(role);
}

/**
 * Check if user can access tenant portal
 */
export function canAccessTenantPortal(role) {
  return role === "tenant";
}

/**
 * Check if user can manage a specific resource
 */
export function canManageResource(userRole, resourceOwnerId, userId) {
  // Admins can manage anything
  if (userRole === "admin") return true;

  // Users can only manage their own resources
  return resourceOwnerId === userId;
}

/**
 * Get allowed routes for a role
 */
export function getAllowedRoutes(role) {
  const routes = {
    admin: ["/dashboard", "/admin", "/properties", "/tenants", "/settings"],
    landlord: ["/dashboard", "/properties", "/tenants", "/rents", "/maintenance"],
    manager: ["/dashboard", "/properties", "/maintenance"],
    tenant: ["/tenant", "/tenant/payments", "/tenant/maintenance", "/tenant/profile"],
    staff: ["/maintenance", "/support"],
  };

  return routes[role] || ["/"];
}

/**
 * Get default redirect route after login
 */
export function getDefaultRoute(role) {
  const defaultRoutes = {
    admin: "/dashboard",
    landlord: "/dashboard",
    manager: "/dashboard",
    tenant: "/tenant",
    staff: "/maintenance",
  };

  return defaultRoutes[role] || "/";
}