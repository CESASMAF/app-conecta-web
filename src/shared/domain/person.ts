// Tipos de domínio de Pessoa (Admin/RH · people-context) — COMPARTILHADOS BFF↔client. PUROS.
export type PersonSummary = Readonly<{ id: string; fullName: string; birthDate: string; active: boolean }>

export type PersonPageMeta = Readonly<{ pageSize: number; totalCount: number; hasMore: boolean; nextCursor: string | null }>
export type PersonPage = Readonly<{ items: readonly PersonSummary[]; meta: PersonPageMeta }>

// Cabeçalho da pessoa (visão composta do BFF — dados + flag active; `partial` se papéis caíram).
export type PersonOverview = Readonly<{ id: string; fullName: string; birthDate: string; active: boolean; partial: boolean }>

// Papel (vínculo system:role) com id — necessário para desativar/reativar.
export type PersonRole = Readonly<{ id: string; system: string; role: string; active: boolean }>
