// Governance (ADR-0001): fronteiras de módulo. Substitui eslint-plugin-boundaries (Princ. IV).
import { test, expect } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const SRC = join(import.meta.dir, '../../src')
const files = (readdirSync(SRC, { recursive: true }) as string[]).filter((f) => /\.(ts|tsx)$/.test(f))
const read = (f: string): string => readFileSync(join(SRC, f), 'utf8')
const importsOf = (src: string): string[] =>
  [...src.matchAll(/(?:import|export)[^'"]*from\s*['"]([^'"]+)['"]/g)].map((m) => m[1] as string)

test('um módulo só importa public-api de outro módulo', () => {
  const violations: string[] = []
  for (const f of files) {
    const self = f.match(/^modules\/([^/]+)\//)?.[1]
    if (!self) continue
    for (const imp of importsOf(read(f))) {
      const tm = imp.match(/^~\/modules\/([^/]+)\/(.+)$/)
      if (tm && tm[1] !== self && !tm[2]!.startsWith('public-api')) violations.push(`${f} → ${imp}`)
    }
  }
  expect(violations).toEqual([])
})

test('external/ nunca importa modules/', () => {
  const violations: string[] = []
  for (const f of files.filter((x) => x.startsWith('external/'))) {
    for (const imp of importsOf(read(f))) {
      if (/^~\/modules\//.test(imp)) violations.push(`${f} → ${imp}`)
    }
  }
  expect(violations).toEqual([])
})
