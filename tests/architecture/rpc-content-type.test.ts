// Governance: a resposta do RPC (`/_server`) precisa sair com Content-Type EXPLÍCITO.
//
// Por que isto existe: o SolidStart serializa o retorno das server functions com seroval e
// marca a resposta só com `x-serialized: true`, sem Content-Type. O cliente RPC dele decide
// nesta ordem — `text/plain` → `.text()`; `application/json` → `.json()`; só DEPOIS
// `x-serialized` → deserializa.
//
// Resposta sem Content-Type que atravessa um servidor Go sofre sniffing automático
// (`http.DetectContentType`, disparado pela AUSÊNCIA do header). O Caddy é Go. Ele carimba
// `text/plain; charset=utf-8`, o cliente cai no primeiro ramo, faz `.text()` e entrega ao
// binding a string crua `;0x000000f0;{…}` em vez do objeto.
//
// O estrago em produção (2026-08-08): `f.ok` vira `undefined`, todo `isOk()` reprova e TODA
// tela abre em "não foi possível carregar" — em qualquer navegação client-side. F5 funciona,
// porque no SSR a função roda in-process e nunca cruza essa fronteira. O bug não deixa erro
// no servidor, não corrompe o payload (o corpo chega íntegro) e some ao recarregar: três
// pistas que levam a investigação para o lugar errado.
//
// O gate é textual porque o comportamento vive na composição middleware+proxy, e um teste de
// integração precisaria de um proxy Go de verdade no meio. O que trava aqui é a INTENÇÃO.
import { test, expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const middleware = readFileSync(join(import.meta.dir, '../../src/middleware.ts'), 'utf8')

test('o middleware carimba Content-Type na resposta do /_server', () => {
  expect(middleware).toContain('onBeforeResponse')
  expect(middleware).toMatch(/['"]\/_server['"]/)
  expect(middleware).toMatch(/content-type/i)
})

test('o Content-Type escolhido não cai nos ramos que o cliente RPC trata antes', () => {
  // Extrai o valor efetivamente setado, não o texto do comentário (que cita os dois proibidos
  // justamente para explicar por que não servem).
  const setado = middleware.match(/headers\.set\(\s*['"]content-type['"]\s*,\s*['"]([^'"]+)['"]/i)
  expect(setado).not.toBeNull()
  const valor = setado![1]!

  // `text/plain` → o cliente faz `.text()` e devolve a string crua: o bug original.
  expect(valor.startsWith('text/plain')).toBe(false)
  // `application/json` → o cliente faz `.json()` sobre um corpo que começa com `;0x…;`
  // e estoura SyntaxError. Seria pior que o problema.
  expect(valor.startsWith('application/json')).toBe(false)
})

test('só carimba quando o header está ausente — não sobrescreve resposta com tipo próprio', () => {
  expect(middleware).toMatch(/headers\.has\(\s*['"]content-type['"]\s*\)/i)
})
