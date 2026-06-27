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
