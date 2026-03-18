export function getRedirectPath({ user, isLoading, currentPath }) {
  if (isLoading) return null;

  // Not signed in
  if (!user) {
    if (currentPath?.startsWith("/auth/")) return null;
    return "/auth/signin";
  }

  // Needs onboarding
  if (!user.role || user.onboardingCompleted === false) {
    if (!currentPath?.startsWith("/onboarding")) {
      return "/onboarding";
    }
    return null;
  }

  // Fully onboarded
  const role = user.role;

  // Prevent access to auth pages
  if (currentPath?.startsWith("/auth/") || currentPath === "/") {
    return getDefaultRoute(role);
  }

  // Role-based protection
  if (currentPath.startsWith("/dashboard") && role !== "landlord") {
    return getDefaultRoute(role);
  }

  if (currentPath.startsWith("/tenant") && role !== "tenant") {
    return getDefaultRoute(role);
  }

  return null;
}

export function getDefaultRoute(role) {
  switch (role) {
    case "landlord":
      return "/dashboard";
    case "tenant":
      return "/tenant";
    default:
      return "/dashboard";
  }
}