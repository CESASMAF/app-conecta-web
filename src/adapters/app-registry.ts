// App Registry — static configuration of available micro-apps.
// Maps app IDs to metadata and required roles for access control.
// The BFF filters apps by the authenticated user's roles (defense in depth).

export type AppRegistryEntry = Readonly<{
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  requiredRoles: readonly string[];
}>;

export const APP_REGISTRY: readonly AppRegistryEntry[] = [
  {
    id: "social-care",
    name: "Assistência Social",
    description: "Prontuário social, avaliações e acompanhamento familiar",
    icon: "heart",
    color: "#4F8448",
    route: "/social-care",
    requiredRoles: ["social_worker", "admin"],
  },
  {
    id: "relatorios",
    name: "Relatórios",
    description: "Indicadores, exportações e painéis gerenciais",
    icon: "chart",
    color: "#C9960A",
    route: "/reports",
    requiredRoles: ["social_worker", "admin", "manager"],
  },
  {
    id: "admin",
    name: "Administração",
    description: "Usuários, permissões e configurações do sistema",
    icon: "settings",
    color: "#172D48",
    route: "/admin",
    requiredRoles: ["admin"],
  },
  {
    id: "saude",
    name: "Saúde",
    description: "Prontuários, diagnósticos e encaminhamentos",
    icon: "stethoscope",
    color: "#A6290D",
    route: "/health-care",
    requiredRoles: ["health_professional", "admin"],
  },
  {
    id: "educacao",
    name: "Educação",
    description: "Acompanhamento escolar e oficinas socioeducativas",
    icon: "book",
    color: "#7B5EA7",
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
