// Formatação de data — pura, sem dep, determinística. Data ISO/-datetime → dd/mm/aaaa; senão devolve cru.
export function formatDate(s: string | null | undefined): string {
  if (!s) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : s
}
