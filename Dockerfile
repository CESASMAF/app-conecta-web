# ── Build stage ──────────────────────────────────────────────────────────────
FROM denoland/deno:2.3.1 AS builder

WORKDIR /app

# Cache dependencies first
COPY deno.json .
RUN deno install

# Copy source
COPY src/ src/

# Type-check
RUN deno check src/**/*.ts

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM denoland/deno:2.3.1

WORKDIR /app

COPY --from=builder /app/deno.json .
COPY --from=builder /app/src/ src/

# Deno caches modules on first run; pre-cache them
RUN deno cache src/server.ts

EXPOSE 8081

CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "src/server.ts"]
