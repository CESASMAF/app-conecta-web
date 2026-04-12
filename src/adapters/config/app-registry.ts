// App Registry — static configuration of available micro-apps.
// Maps app IDs to metadata and required roles for access control.
// The BFF filters apps by the authenticated user's roles (defense in depth).
//
// NOTE: Colors below are app-identity values sent as data to the client.
// Adapters cannot import from client/styles (boundary rule), so they live here.
// Keep in sync with the design token palette when adding new apps.

export type AppRegistryEntry = Readonly<{
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  requiredRoles: readonly string[];
}>;

const APP_COLOR = {
  green: "#4F8448",
  gold: "#C9960A",
  navy: "#172D48",
  red: "#A6290D",
  purple: "#7B5EA7",
} as const;

export const APP_REGISTRY: readonly AppRegistryEntry[] = [
  {
    id: "social-care",
    name: "Assistência Social",
    description: "Prontuário social, avaliações e acompanhamento familiar",
    icon: "heart",
    color: APP_COLOR.green,
    route: "/social-care",
    requiredRoles: ["social_worker", "admin"],
  },
  {
    id: "relatorios",
    name: "Relatórios",
    description: "Indicadores, exportações e painéis gerenciais",
    icon: "chart",
    color: APP_COLOR.gold,
    route: "/reports",
    requiredRoles: ["social_worker", "admin", "manager"],
  },
  {
    id: "admin",
    name: "Administração",
    description: "Usuários, permissões e configurações do sistema",
    icon: "settings",
    color: APP_COLOR.navy,
    route: "/admin",
    requiredRoles: ["admin"],
  },
  {
    id: "saude",
    name: "Saúde",
    description: "Prontuários, diagnósticos e encaminhamentos",
    icon: "stethoscope",
    color: APP_COLOR.red,
    route: "/health-care",
    requiredRoles: ["health_professional", "admin"],
  },
  {
    id: "educacao",
    name: "Educação",
    description: "Acompanhamento escolar e oficinas socioeducativas",
    icon: "book",
    color: APP_COLOR.purple,
    route: "/education",
    requiredRoles: ["social_worker", "educator", "admin"],
  },
] as const;

/** Filter apps the user is authorized to access based on their roles. */
export const getAppsForRoles = (
  roles: readonly string[],
): readonly AppRegistryEntry[] =>
  APP_REGISTRY.filter((app) =>
    app.requiredRoles.some((r) => roles.includes(r))
  );
