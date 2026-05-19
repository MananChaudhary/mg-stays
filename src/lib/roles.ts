/** App roles — keep in sync with prisma UserRole enum (no Prisma import for client components) */
export type DashboardRole = "ADMIN" | "PROPERTY_OWNER" | "STAFF";

/** MG Stays platform owner (Google sign-in). Override with ADMIN_EMAILS in .env if needed. */
export const DEFAULT_OWNER_EMAIL = "mananchau786@gmail.com";

/** Platform owner — full MG Stays access */
export function isOwner(role: DashboardRole) {
  return role === "ADMIN";
}

export function getOwnerEmails(): string[] {
  const fromEnv =
    process.env.ADMIN_EMAILS?.split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean) ?? [];

  if (fromEnv.length > 0) return fromEnv;
  return [DEFAULT_OWNER_EMAIL.toLowerCase()];
}

export function isOwnerEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return normalized.length > 0 && getOwnerEmails().includes(normalized);
}

export function roleLabel(role: DashboardRole) {
  switch (role) {
    case "ADMIN":
      return "Owner";
    case "STAFF":
      return "Team";
    default:
      return "Client";
  }
}

export type NavItemId =
  | "dashboard"
  | "properties"
  | "calendar"
  | "bookings"
  | "messages"
  | "integrations"
  | "ai-assistant"
  | "clients"
  | "settings";

const OWNER_ONLY_NAV: NavItemId[] = ["clients", "integrations"];

export function canAccessNav(role: DashboardRole, item: NavItemId) {
  if (isOwner(role)) return true;
  return !OWNER_ONLY_NAV.includes(item);
}

export function canAccessDashboardPath(role: DashboardRole, pathname: string) {
  if (isOwner(role)) return true;
  if (pathname.startsWith("/dashboard/clients")) return false;
  if (pathname.startsWith("/dashboard/integrations")) return false;
  return true;
}

export function resolveRoleForNewUser(email: string): DashboardRole {
  return isOwnerEmail(email) ? "ADMIN" : "PROPERTY_OWNER";
}
