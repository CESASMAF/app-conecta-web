// GET /api/v1/me — Returns the current user's profile and permitted apps.
// Reads from session (no external call needed). App filtering is server-side.

import { Hono } from "@hono/hono";
import type { AppEnv } from "../types.ts";
import { getAppsForRoles } from "../adapters/app-registry.ts";

export const meRoutes = new Hono<AppEnv>();

/** Extract initials from a full name (first + last). */
export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    const first = parts[0]?.[0] ?? "";
    const last = parts[parts.length - 1]?.[0] ?? "";
    return (first + last).toUpperCase();
  }
  return (parts[0]?.[0] ?? "?").toUpperCase();
};

/** Map roles to a human-readable Portuguese label. */
export const formatRole = (roles: readonly string[]): string => {
  if (roles.includes("admin")) return "Administrador";
  if (roles.includes("social_worker")) return "Assistente Social";
  if (roles.includes("owner")) return "Gestor";
  if (roles.includes("manager")) return "Gestor";
  if (roles.includes("health_professional")) return "Profissional de Saúde";
  if (roles.includes("educator")) return "Educador";
  return "Usuário";
};

meRoutes.get("/api/v1/me", (c) => {
  const session = c.get("session");
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const apps = getAppsForRoles(session.roles);
  const firstName = session.userName.split(" ")[0] ?? session.userName;

  return c.json({
    data: {
      name: session.userName,
      firstName,
      initials: getInitials(session.userName),
      role: formatRole(session.roles),
      apps: apps.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        color: a.color,
        route: a.route,
      })),
      lastUsedAppId: null,
    },
    meta: { timestamp: new Date().toISOString() },
  });
});
