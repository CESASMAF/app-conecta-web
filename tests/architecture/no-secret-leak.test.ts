// Governance (SC-004 / Princ. I): código alcançável pelo client NÃO importa módulos server-only
// (env/sessão/BFF) — é o que impede token/segredo de chegar ao browser. Gate automatizado.
// Complementa o grep do bundle no quickstart (T054).
import { test, expect } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const SRC = join(import.meta.dir, '../../src')
const files = (readdirSync(SRC, { recursive: true }) as string[]).filter((f) => /\.(ts|tsx)$/.test(f))
const read = (f: string): string => readFileSync(join(SRC, f), 'utf8')
const importsOf = (src: string): string[] =>
  [...src.matchAll(/(?:import|export)[^'"]*from\s*['"]([^'"]+)['"]/g)].map((m) => m[1] as string)

// server-only: nada disto pode ser importado por código de client.
const SERVER_ONLY = [/^~\/server\//, /^~\/external\/session-store/, /^~\/external\/.*session/i]

const isClientReachable = (f: string): boolean =>
  f === 'app.tsx' ||
  f === 'entry-client.tsx' ||
  (/^routes\//.test(f) && !/^routes\/api\//.test(f)) ||
  /modules\/[^/]+\/client\//.test(f)

test('código client não importa server-only (sem vazar token/segredo) — SC-004', () => {
  const violations: string[] = []
  for (const f of files.filter(isClientReachable)) {
    for (const imp of importsOf(read(f))) {
      if (SERVER_ONLY.some((re) => re.test(imp))) violations.push(`${f} → ${imp}`)
    }
  }
  expect(violations).toEqual([])
})
