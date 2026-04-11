#!/bin/bash
# setup-env.sh — Gera .env local a partir do Bitwarden Secrets Manager
#
# Pré-requisito: brew install bitwarden/tap/bws
# Uso: BWS_ACCESS_TOKEN="<token>" ./scripts/setup-env.sh

set -euo pipefail

if [ -z "${BWS_ACCESS_TOKEN:-}" ]; then
  echo "Erro: defina BWS_ACCESS_TOKEN antes de rodar este script"
  echo ""
  echo "  export BWS_ACCESS_TOKEN=\"<seu-token>\""
  echo "  ./scripts/setup-env.sh"
  exit 1
fi

echo "Puxando secrets do Bitwarden (ambiente staging)..."

CLIENT_ID=$(bws secret get 0a82890b-0fb4-49d6-bbc6-b42400d47c5e | python3 -c "import sys,json; print(json.load(sys.stdin)['value'])")
CLIENT_SECRET=$(bws secret get 4189ce3a-c21f-406e-bf8a-b42400d48aed | python3 -c "import sys,json; print(json.load(sys.stdin)['value'])")
SESSION_SECRET=$(bws secret get 95c92038-0fd5-4c7d-ba7a-b42400d49e45 | python3 -c "import sys,json; print(json.load(sys.stdin)['value'])")

cat > .env <<EOF
# Server
PORT=8081
HOST=0.0.0.0
SESSION_TTL_MINUTES=60

# Backend (aponta para HML)
API_BASE_URL=https://social-care-hml.acdgbrasil.com.br
PEOPLE_CONTEXT_BASE_URL=https://people-hml.acdgbrasil.com.br

# OIDC (Zitadel)
OIDC_ISSUER=https://auth.acdgbrasil.com.br
OIDC_CLIENT_ID=${CLIENT_ID}
OIDC_CLIENT_SECRET=${CLIENT_SECRET}
OIDC_REDIRECT_URI=https://localhost/auth/callback

# Session
SESSION_SECRET=${SESSION_SECRET}
EOF

echo ".env gerado com sucesso!"
echo ""
echo "Para rodar: deno task dev"
