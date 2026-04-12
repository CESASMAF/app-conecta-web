# ── Build stage ──────────────────────────────────────────────────────────────
FROM denoland/deno:2.7.11 AS builder

WORKDIR /app

# Cache dependencies first
COPY deno.json .
RUN deno install

# Copy source
COPY src/ src/

# Type-check
RUN deno check src/**/*.ts src/**/*.tsx

# Bundle client-side apps for browser (single source of truth: deno.json)
RUN deno task build

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM denoland/deno:2.7.11

WORKDIR /app

COPY --from=builder /app/deno.json .
COPY --from=builder /app/src/ src/
COPY --from=builder /app/static/ static/

# Pre-cache server modules and fix ownership for non-root runtime
RUN deno cache src/server.ts && chown -R deno:deno /app /deno-dir

USER deno

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["deno", "eval", "--allow-net", "const r = await fetch('http://localhost:8081/health'); Deno.exit(r.ok ? 0 : 1)"]

CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "src/server.ts"]
