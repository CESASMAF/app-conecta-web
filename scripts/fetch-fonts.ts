#!/usr/bin/env bun
// Aquisição reprodutível dos webfonts self-hosted (ADR-0008) — ZERO dependência npm de fonte.
// Uso: `bun run fonts:fetch` (ou `bun scripts/fetch-fonts.ts`).
//
// Por que script e não `@fontsource`: a regra Bun-native/zero-npm proíbe trazer um pacote npm cujo
// único conteúdo são assets (.woff2). Os arquivos ficam versionados em public/fonts/ (servidos
// same-origin pelo SolidStart/Caddy — nada de fonts.gstatic.com, sem vazar IP do usuário, LGPD).
//
// Provenance: origem (Fontsource via jsDelivr, upstream oficial) + SHA-256 fixados abaixo. O download
// é VERIFICADO contra o hash; divergência aborta (supply-chain). Atualizar fonte = trocar version/url/
// sha256 aqui, rodar o script e commitar o novo .woff2.
//
// Famílias: batem com os tokens `vars.font.{sans,mono}` em src/shared/ui/tokens/theme.css.ts.
// `:vf` = variable (todos os pesos num arquivo); subset `latin` cobre o PT-BR (acentuação completa).
import { createHash } from 'node:crypto'
import { mkdir } from 'node:fs/promises'

type FontAsset = Readonly<{
  family: string
  version: string // versão Fontsource (provenance)
  url: string
  out: string
  sha256: string
}>

const OUT_DIR = new URL('../public/fonts/', import.meta.url)

const FONTS: readonly FontAsset[] = [
  {
    family: 'Atkinson Hyperlegible Next',
    version: 'v7',
    url: 'https://cdn.jsdelivr.net/fontsource/fonts/atkinson-hyperlegible-next:vf@latest/latin-wght-normal.woff2',
    out: 'atkinson-hyperlegible-next-latin-wght-normal.woff2',
    sha256: '18b2a1a39a2fa298b0ba5390aca68462669826c90925656f1c1f6796e0e1bbaf',
  },
  {
    family: 'Atkinson Hyperlegible Mono',
    version: 'v8',
    url: 'https://cdn.jsdelivr.net/fontsource/fonts/atkinson-hyperlegible-mono:vf@latest/latin-wght-normal.woff2',
    out: 'atkinson-hyperlegible-mono-latin-wght-normal.woff2',
    sha256: '2706b1ee4f452e744ea91f7e4908cbde9c5d35521bf5ffffc71a382a2de89613',
  },
]

const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex')

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true })
  let failures = 0
  for (const f of FONTS) {
    try {
      const res = await fetch(f.url)
      if (!res.ok) {
        console.error(`✗ ${f.family}: HTTP ${res.status} em ${f.url}`)
        failures++
        continue
      }
      const bytes = new Uint8Array(await res.arrayBuffer())
      const got = sha256(bytes)
      if (got !== f.sha256) {
        console.error(`✗ ${f.family}: SHA-256 divergente (supply-chain).\n   esperado ${f.sha256}\n   obtido   ${got}`)
        failures++
        continue
      }
      await Bun.write(new URL(f.out, OUT_DIR), bytes)
      console.log(`✓ ${f.family} (Fontsource ${f.version}) — ${bytes.byteLength} B — sha256 ok → public/fonts/${f.out}`)
    } catch (cause) {
      console.error(`✗ ${f.family}: falha de rede — ${(cause as Error).message}`)
      failures++
    }
  }
  if (failures > 0) {
    console.error(`\n${failures} fonte(s) falharam. Abortando.`)
    process.exit(1)
  }
  console.log('\nTodos os webfonts verificados e gravados em public/fonts/.')
}

await main()
