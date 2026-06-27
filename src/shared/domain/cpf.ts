// Validação de CPF (MOD-11) — pura, sem dep (Princ. IV). Compartilhada (pacientes + pessoas).
// Rejeita tamanho ≠ 11 e dígitos repetidos.
const digits = (s: string): string => s.replace(/\D/g, '')

export function isValidCpf(raw: string): boolean {
  const d = digits(raw)
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  const checkDigit = (len: number): number => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i)
    const r = (sum * 10) % 11
    return r === 10 ? 0 : r
  }
  return checkDigit(9) === Number(d[9]) && checkDigit(10) === Number(d[10])
}
