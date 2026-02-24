
export function getEffectiveRole(user) {
  const devRole = localStorage.getItem("dev-role");

  if (devRole) return devRole;

  return user?.publicMetadata?.role;
}
