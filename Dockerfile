# ── Build stage ──────────────────────────────────────────────────────────────
FROM denoland/deno:2.7.11 AS builder

WORKDIR /app

# Cache dependencies first
COPY deno.json .
RUN deno install

# Copy source
COPY src/ src/

# Type-check
RUN deno check src/**/*.ts

# Bundle client-side apps for browser
RUN mkdir -p static/js && \
    deno bundle --platform browser --minify -o static/js/social-care.js src/client/apps/social-care/entry.tsx && \
    deno bundle --platform browser --minify -o static/js/registration.js src/client/apps/registration/entry.tsx && \
    deno bundle --platform browser --minify -o static/js/family-composition.js src/client/apps/family-composition/entry.tsx

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM denoland/deno:2.7.11

WORKDIR /app

COPY --from=builder /app/deno.json .
COPY --from=builder /app/src/ src/
COPY --from=builder /app/static/ static/

# Pre-cache server modules
RUN deno cache src/server.ts

EXPOSE 8081

CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "src/server.ts"]
