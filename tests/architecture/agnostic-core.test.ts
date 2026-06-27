// Governance (ADR-0009): o núcleo do client é PURO — *.view-model.ts e data/ e domain/ não
// importam Solid. Trocar a primitiva reativa = mexer só nos *.binding.ts.
import { test, expect } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const SRC = join(import.meta.dir, '../../src')
const files = (readdirSync(SRC, { recursive: true }) as string[]).filter((f) => /\.(ts|tsx)$/.test(f))
const read = (f: string): string => readFileSync(join(SRC, f), 'utf8')
const importsOf = (src: string): string[] =>
  [...src.matchAll(/(?:import|export)[^'"]*from\s*['"]([^'"]+)['"]/g)].map((m) => m[1] as string)

test('núcleo client (*.view-model.ts, data/, domain/) não importa solid-js/@solidjs/*', () => {
  const core = files.filter(
    (f) => /\.view-model\.ts$/.test(f) || /modules\/[^/]+\/client\/(data|domain)\//.test(f),
  )
  const violations: string[] = []
  for (const f of core) {
    for (const imp of importsOf(read(f))) {
      if (imp === 'solid-js' || imp.startsWith('@solidjs/')) violations.push(`${f} → ${imp}`)
    }
  }
  expect(violations).toEqual([])
})
