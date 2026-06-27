// ViewModel PURO do shell (ADR-0012) — sem Solid; testável em bun:test.
// Menu filtrado por PAPEL (RBAC só de EXIBIÇÃO; autorização real é do backend). Cada área = um serviço:
// Pacientes (social-care · worker) · Pessoas (people-context · admin) · Indicadores (analysis-bi · analyst).
// `superadmin` vê tudo. Aceita papel simples ('worker') e composto ('social-care:worker').
export type MenuItem = Readonly<{
  id: string
  label: string
  href: string
  requiredGroup?: string
}>

const MENU: readonly MenuItem[] = [
  { id: 'patients', label: 'Pacientes', href: '/patients', requiredGroup: 'worker' },
  { id: 'people', label: 'Pessoas', href: '/people', requiredGroup: 'admin' },
  { id: 'indicators', label: 'Indicadores', href: '/indicators', requiredGroup: 'analyst' },
]

const TITLES: Readonly<Record<string, string>> = {
  '/': 'Início',
  '/patients': 'Pacientes',
  '/people': 'Pessoas',
  '/indicators': 'Indicadores',
}

// Tem o papel exigido? superadmin bypassa; aceita papel simples ou composto (`<sistema>:<papel>`).
const hasGroup = (groups: readonly string[], required: string): boolean =>
  groups.includes('superadmin') || groups.includes(required) || groups.some((g) => g.endsWith(`:${required}`))

export const rootViewModel = {
  visibleMenu: (groups: readonly string[]): readonly MenuItem[] =>
    MENU.filter((item) => !item.requiredGroup || hasGroup(groups, item.requiredGroup)),
  pageTitle: (path: string): string => TITLES[path] ?? 'RAROS Boa Vista',
  isActive: (path: string, href: string): boolean =>
    href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`),
  // Destino padrão ao entrar: a primeira área visível ao papel do usuário (Inc 1 → Pacientes p/ worker).
  landingHref: (groups: readonly string[]): string => {
    const first = MENU.find((item) => !item.requiredGroup || hasGroup(groups, item.requiredGroup))
    return first?.href ?? '/patients'
  },
}
