// Formatação de data — pura, sem dep, determinística. Data ISO/-datetime → dd/mm/aaaa; senão devolve cru.
export function formatDate(s: string | null | undefined): string {
  if (!s) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : s
}

// 'yyyy-mm-dd' (o que o <input type=date> produz) → ISO8601 completo, que é o que o social-care
// exige ao decodificar TimeStamp. Sem isto o backend responde HTTP-400 "Expected date string to be
// ISO8601-formatted" e a tela mostra "informações inválidas" sem dizer qual campo.
//
// A CONCATENAÇÃO é proposital: `new Date('2015-08-10T00:00:00').toISOString()` interpreta no fuso
// local (BRT = UTC−3) e devolve '2015-08-10T03:00:00Z' — o caminho de volta desloca o dia civil e
// uma data de nascimento passa a cair um dia antes. Montar a string à mão preserva o dia.
//
// Já vem em ISO completo, vazio ou em outro formato? devolve intacto — quem valida é o backend.
export function toIso8601 <T extends string | null | undefined>(date: T): T | string {
  if (!date) return date
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00Z` : date
}
