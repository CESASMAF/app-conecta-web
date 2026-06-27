# syntax=docker/dockerfile:1
# web_02 — build multi-stage (ADR-0003 itens 6/7). node_modules é ARTEFATO DE BUILD: existe só no
# estágio `build`; o runtime roda o bundle do Nitro (.output/, preset bun) SEM node_modules.
# Imagem oven/bun com pin de versão (reprodutível); bate com o Bun usado em dev/CI (bun.lock).

# ─────────────────────────── build ───────────────────────────
FROM oven/bun:1.3.14 AS build
WORKDIR /app

# Manifestos primeiro → cache de camada de deps; install com lockfile congelado (frozen).
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

# Código + build. O Nitro (preset bun) empacota as deps em .output/server/index.mjs.
COPY . .
RUN bun run build

# ────────────────────────── runtime ──────────────────────────
# `-slim` (Debian slim com shell — necessário para o HEALTHCHECK). Sem node_modules aqui.
FROM oven/bun:1.3.14-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

# Só o bundle do servidor + assets públicos (inclui public/fonts/ self-hosted — ADR-0008).
COPY --from=build /app/.output ./.output

EXPOSE 3000

# "Constante" (resiliência): o orquestrador derruba o container se o BFF parar de responder.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Não-root (a imagem oven/bun já traz o usuário `bun`).
USER bun
CMD ["bun", ".output/server/index.mjs"]
