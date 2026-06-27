// Governance (ADR-0011): nada de mock em src/. Roda em bun test (Princ. IV — sem ESLint).
import { test, expect } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const SRC = join(import.meta.dir, '../../src')
const files = (readdirSync(SRC, { recursive: true }) as string[]).filter((f) => /\.(ts|tsx)$/.test(f))

test('sem arquivos *-mock.* / *.mock.* em src/', () => {
  const mocks = files.filter((f) => /(-mock\.|\.mock\.)/.test(f))
  expect(mocks).toEqual([])
})

test('sem identificador MOCK_ em src/', () => {
  const offenders = files.filter((f) => /\bMOCK_[A-Z]/.test(readFileSync(join(SRC, f), 'utf8')))
  expect(offenders).toEqual([])
})
