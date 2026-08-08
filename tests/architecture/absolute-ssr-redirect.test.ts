// Governance (infra#14): `redirect()` numa server function precisa de URL ABSOLUTA.
//
// Com path relativo o SSR não consegue mais trocar o status — o stream já saiu — e responde
// 200 com um header `Location` que o browser ignora, caindo num `<script>window.location=…`
// que a nossa própria CSP (`strict-dynamic`, script sem nonce) bloqueia. O resultado é uma
// página que carrega, não dá erro, não faz requisição e nunca sai do lugar. Custou uma
// investigação inteira em produção; um literal relativo é barato demais para reintroduzir.
//
// Não vale como teste unitário: `redirect()` do @solidjs/router exige o runtime do router e
// estoura fora dele. O gate é estático, no lugar onde o defeito nasce.
import { test, expect } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const SRC = join(import.meta.dir, '../../src')
const files = (readdirSync(SRC, { recursive: true }) as string[]).filter((f) => /\.(ts|tsx)$/.test(f))
const read = (f: string): string => readFileSync(join(SRC, f), 'utf8')

// `redirect('...')` / `throw redirect("...")` com string literal que NÃO começa com esquema.
// Só literais: uma variável pode perfeitamente carregar uma absoluta — é o caso do
// `createLoginBrowserUrl`, que devolve a URL pública do Kratos já montada.
const RELATIVE_LITERAL = /\bredirect\(\s*(['"])(?!https?:)([^'"]*)\1/g

// O escopo é a server function, onde o redirect é resolvido DURANTE o render e disputa com o
// stream. Fora dela o mesmo literal é seguro, por motivos diferentes e igualmente válidos:
//   • `middleware.ts` roda em `onRequest`, antes do render — nenhum byte saiu, o status é nosso.
//   • o guard de `routes/(app).tsx` é a defesa de navegação SPA; no SSR do documento o middleware
//     responde primeiro (verificado em produção: /patients, /people e /indicators dão 302).
const isServerFn = (src: string): boolean => /^\s*(['"])use server\1/m.test(src)

test('server function não usa redirect relativo (vira 200 no SSR) — infra#14', () => {
  const violations: string[] = []
  for (const f of files) {
    const src = read(f)
    if (!isServerFn(src)) continue
    for (const m of src.matchAll(RELATIVE_LITERAL)) violations.push(`${f} → redirect('${m[2]}')`)
  }
  expect(violations).toEqual([])
})

// O gate acima só vale se estiver realmente varrendo alguma coisa: um refactor que troque a
// diretiva por outro mecanismo o transformaria num teste vazio que passa para sempre.
test('o gate enxerga as server functions que existem', () => {
  expect(files.filter((f) => isServerFn(read(f))).length).toBeGreaterThan(5)
})
