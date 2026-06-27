// Model do usuário atual (retorno do BFF /me). Mínimo (FR-008): quem está logado + papéis p/ exibição.
export type CurrentUser = Readonly<{
  userId: string
  displayName: string | null
  groups: readonly string[]
}>
