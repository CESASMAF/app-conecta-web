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

// `groups` chega de fora (sessão, revalidação de query, hidratação) e nem sempre é um array:
// em produção o shell recebeu um objeto SEM `groups` durante a revalidação disparada por uma
// mutação que falhou, e o `.includes` explodiu — a tela inteira virou "Uncaught Client Exception"
// em vez de mostrar o erro no formulário. RBAC de exibição não pode derrubar documento: na
// dúvida mostra menos, nunca mais. A autorização real é do backend.
const asGroups = (groups: readonly string[] | undefined | null): readonly string[] =>
  Array.isArray(groups) ? groups : []

// Tem o papel exigido? superadmin bypassa; aceita papel simples ou composto (`<sistema>:<papel>`).
const hasGroup = (groups: readonly string[], required: string): boolean =>
  groups.includes('superadmin') || groups.includes(required) || groups.some((g) => g.endsWith(`:${required}`))

// Rótulo PT-BR do papel principal (só exibição, no card do rail). Ordem = prioridade.
const ROLE_LABELS: readonly (readonly [string, string])[] = [
  ['superadmin', 'Superadmin'],
  ['worker', 'Assistente Social'],
  ['owner', 'Administrador'],
  ['admin', 'Administrador'],
  ['analyst', 'Analista'],
  ['exporter', 'Analista'],
]

// Papel exigido por uma ROTA (não só pelo item de menu): `/people/new` e `/people/:id` herdam a
// exigência de `/people`. Existe para o guard de página usar a MESMA fonte que o menu — esconder do
// menu não protegia nada: o worker abria /people por URL, via as pessoas e criava uma nova.
export const requiredGroupForPath = (path: string): string | undefined =>
  MENU.find((item) => path === item.href || path.startsWith(`${item.href}/`))?.requiredGroup

// Todas as entradas passam por `asGroups`: são chamadas do render, e um throw aqui derruba a tela.
export const rootViewModel = {
  visibleMenu: (groups: readonly string[] | undefined): readonly MenuItem[] => {
    const g = asGroups(groups)
    return MENU.filter((item) => !item.requiredGroup || hasGroup(g, item.requiredGroup))
  },
  // exposto p/ a UI decidir o que RENDERIZAR (ação que o papel não pode não deve ser oferecida)
  canAccess: (groups: readonly string[] | undefined, required: string | undefined): boolean =>
    !required || hasGroup(asGroups(groups), required),
  pageTitle: (path: string): string => TITLES[path] ?? 'RAROS Boa Vista',
  roleLabel: (groups: readonly string[] | undefined): string => {
    const g = asGroups(groups)
    const match = ROLE_LABELS.find(([r]) => g.includes(r) || g.some((x) => x.endsWith(`:${r}`)))
    return match ? match[1] : 'Usuário'
  },
  isActive: (path: string, href: string): boolean =>
    href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`),
  // Destino padrão ao entrar: a primeira área visível ao papel do usuário (Inc 1 → Pacientes p/ worker).
  //
  // `null` quando NENHUMA área é acessível. O fallback antigo (`?? '/patients'`) devolvia uma
  // rota que o próprio guard nega em seguida, e o middleware redirecionava para ela de novo:
  // um usuário sem papel nenhum (identidade provisionada antes da atribuição) batia em
  // ERR_TOO_MANY_REDIRECTS em toda área, sem erro e sem log. Quem chama decide o que fazer —
  // não existe destino seguro para inventar aqui.
  landingHref: (groups: readonly string[] | undefined): string | null => {
    const g = asGroups(groups)
    return MENU.find((item) => !item.requiredGroup || hasGroup(g, item.requiredGroup))?.href ?? null
  },
}
