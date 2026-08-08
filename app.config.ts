import { fileURLToPath } from 'node:url'
import { defineConfig } from '@solidjs/start/config'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'

// SolidStart (Vinxi/Nitro). Preset `bun` -> .output/server/index.mjs roda sem node_modules (ADR-0003).
// vanillaExtractPlugin como 1o plugin do Vite (ADR-0007).
// serialization JSON: evita `unsafe-eval` na CSP estrita (ADR-0006) — SolidStart v1 default é `js`.
export default defineConfig({
  server: {
    preset: 'bun',
  },
  // O middleware do SolidStart NÃO é auto-descoberto — precisa ser registrado aqui (ADR-0006).
  middleware: 'src/middleware.ts',
  // ⚠️ ANDA JUNTO com o carimbo de Content-Type em `src/middleware.ts` (onBeforeResponse).
  // Só o modo `js` do SolidStart carimba Content-Type na resposta do `/_server`; o modo `json`
  // manda só `x-serialized: true`. Sem Content-Type, um proxy Go (o Caddy) fareja e escreve
  // `text/plain`, e o cliente RPC — que testa Content-Type ANTES de `x-serialized` — passa a
  // ler a resposta como TEXTO. Toda tela abre em "não foi possível carregar", sem erro no
  // servidor e com o corpo íntegro. Derrubou a produção em 2026-08-08.
  serialization: {
    mode: 'json',
  },
  vite: {
    plugins: [vanillaExtractPlugin()],
    // alias `~` p/ o compilador do vanilla-extract resolver os tokens (não herda o tsconfig paths).
    resolve: {
      alias: { '~': fileURLToPath(new URL('./src', import.meta.url)) },
    },
  },
})
