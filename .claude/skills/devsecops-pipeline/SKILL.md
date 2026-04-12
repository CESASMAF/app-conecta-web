---
name: devsecops-pipeline
description: |
  Especialista em DevSecOps para aplicações Web/JS/TS/React/Node.js. Cobre segurança de CI/CD, Docker, gerenciamento de dependências (npm), supply chain security, secrets management, e Infrastructure as Code. Use esta skill SEMPRE que o usuário mencionar: Docker, Dockerfile, docker-compose, container, CI/CD, GitHub Actions, pipeline, npm audit, dependências, package.json, supply chain, secrets, .env, variáveis de ambiente, deploy seguro, infraestrutura, Kubernetes, K8s, Terraform, IaC, scan de vulnerabilidades, SBOM, ou qualquer tópico sobre segurança de infraestrutura e pipeline de desenvolvimento. Também acione quando o usuário perguntar sobre como configurar segurança no processo de build/deploy, ou sobre boas práticas de DevOps com segurança.
---

# DevSecOps Pipeline — Segurança de Infraestrutura e Deploy

Você é um engenheiro DevSecOps que garante que segurança está integrada em cada etapa do pipeline de desenvolvimento — do commit ao deploy. Seu foco é "shift left": encontrar e corrigir problemas de segurança o mais cedo possível.

## Pilares DevSecOps

### 1. Segurança de Dependências (npm/Node.js)

Dependências vulneráveis são um dos vetores de ataque mais comuns em aplicações Node.js.

#### Auditoria Contínua
```bash
# Auditoria básica
npm audit

# Auditoria com fix automático (cuidado em produção)
npm audit fix

# Apenas vulnerabilidades críticas e altas
npm audit --audit-level=high

# Em CI/CD: falhar o build se houver vulnerabilidades
npm audit --audit-level=high || exit 1
```

#### Lockfile Security
```bash
# SEMPRE usar npm ci em CI/CD (respeita lockfile exato)
npm ci --frozen-lockfile

# Nunca npm install em CI/CD (pode alterar lockfile)
```

**Regras:**
- `package-lock.json` DEVE estar no git
- Revisar PRs que alteram `package-lock.json` com atenção extra
- Configurar Dependabot ou Renovate para updates automáticos
- Verificar scripts `postinstall` de deps novas (podem executar código malicioso)

#### Checklist de Dependências
- Verificar se a dep é mantida ativamente (último commit, issues abertas)
- Preferir deps com poucos subdependencies (menor superfície de ataque)
- Auditar deps que pedem permissões incomuns (network, filesystem)
- Usar `npm ls --all` para ver a árvore completa de dependências

### 2. Docker Security

#### Dockerfile Seguro
```dockerfile
# 1. Usar imagem base específica (NUNCA :latest)
FROM node:20.11.1-alpine AS builder

# 2. Criar usuário não-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# 3. Copiar apenas o necessário
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --chown=appuser:appgroup . .

# 4. Multi-stage build (imagem final menor e mais segura)
FROM node:20.11.1-alpine AS runtime
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY --from=builder --chown=appuser:appgroup /app .

# 5. Rodar como não-root
USER appuser

# 6. Expor apenas a porta necessária
EXPOSE 3000

# 7. Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000/health || exit 1

# 8. Usar exec form (PID 1 correto)
CMD ["node", "server.js"]
```

#### docker-compose Security
```yaml
services:
  app:
    image: myapp:1.2.3       # versão fixa
    read_only: true           # filesystem read-only
    security_opt:
      - no-new-privileges:true  # previne escalação de privilégio
    cap_drop:
      - ALL                    # remove TODAS as capabilities
    cap_add:
      - NET_BIND_SERVICE       # adiciona APENAS o necessário
    tmpfs:
      - /tmp                   # temp em memória
    environment:
      - NODE_ENV=production
    # NUNCA montar docker.sock
    # volumes:
    #   - /var/run/docker.sock:/var/run/docker.sock  # PERIGO!
```

#### Checklist Docker
- Scan de imagens: `trivy image myapp:latest`
- Nunca rodar como root
- Nunca usar `--privileged`
- Nunca expor Docker socket
- Multi-stage builds para reduzir superfície
- `.dockerignore` incluindo `.env`, `.git`, `node_modules`
- Secrets via Docker Secrets ou vault, NUNCA ENV no Dockerfile

### 3. CI/CD Pipeline Security

#### GitHub Actions — Template Seguro
```yaml
name: Secure CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read        # Least privilege

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Scan de secrets no código
      - name: Secret Scan
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified
      
      # Audit de dependências
      - name: Install & Audit
        run: |
          npm ci --frozen-lockfile
          npm audit --audit-level=high
      
      # SAST (Static Application Security Testing)
      - name: CodeQL Analysis
        uses: github/codeql-action/analyze@v3
      
      # Lint de segurança
      - name: ESLint Security
        run: npx eslint --config .eslintrc.security.js .
      
      # Scan de container (se aplicável)
      - name: Container Scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'myapp:${{ github.sha }}'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
  
  build:
    needs: security-scan  # Só builda se security passar
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci --frozen-lockfile
      - run: npm run build
      - run: npm test
```

#### Regras de Pipeline
- **Least privilege**: Jobs só têm as permissões que precisam
- **Pin actions por SHA**: `uses: actions/checkout@abc123` (não `@v4`)
- **Secrets em vault**: Nunca hardcode em workflow files
- **Branch protection**: Require reviews, status checks, signed commits
- **Artifact signing**: Assinar builds para garantir integridade
- **Ephemeral runners**: Destroy after use quando possível

### 4. Secrets Management

#### Hierarquia de Segurança (melhor → pior)
1. **Vault dedicado** (HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager)
2. **CI/CD Secrets** (GitHub Secrets, GitLab Variables)
3. **Variáveis de ambiente** (aceitável em containers gerenciados)
4. **Arquivos .env** (apenas desenvolvimento local)
5. ~~Hardcoded no código~~ — NUNCA

#### Pre-commit Hook para Secrets
```bash
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
```

#### Padrões a Detectar
```bash
# Regex para encontrar secrets no código
AWS_ACCESS_KEY_ID=AKIA[0-9A-Z]{16}
password\s*=\s*['"][^'"]+['"]
api[_-]?key\s*[:=]\s*['"][^'"]+['"]
secret\s*[:=]\s*['"][^'"]+['"]
-----BEGIN (RSA |EC )?PRIVATE KEY-----
ghp_[A-Za-z0-9_]{36}        # GitHub Personal Access Token
sk-[A-Za-z0-9]{48}           # OpenAI API Key
```

### 5. Infrastructure as Code (IaC) Security

#### Checklist para Terraform/CloudFormation
- Scan com `tfsec`, `checkov`, ou `terrascan`
- Nunca commitar state files com secrets
- Usar remote state com encryption
- Least privilege para IAM roles
- Encryption at rest habilitado para todo storage
- VPCs com network segmentation
- Security groups restritivos (não `0.0.0.0/0` para tudo)

### 6. Monitoring & Incident Response

#### Logging de Segurança
```typescript
// O que logar (para detecção de ataques)
const securityEvents = [
  'auth.login.success',
  'auth.login.failure',
  'auth.logout',
  'auth.password_reset',
  'auth.mfa_challenge',
  'access.forbidden',         // 403s
  'input.validation_failure', // Possível probing
  'rate_limit.exceeded',      // Possível brute force/DoS
  'api.key.invalid',          // Possível credential stuffing
];

// O que NUNCA logar
const neverLog = [
  'passwords (plain or hashed)',
  'session tokens',
  'API keys',
  'credit card numbers',
  'PII sem necessidade',
];
```

#### Alertas Automáticos
Configure alertas para:
- Spike de 401/403 (brute force attempt)
- Spike de 429 (rate limit hit — possível DoS)
- Login de IP/localização incomum
- Múltiplas falhas de validação do mesmo IP (scanning)
- Mudanças em roles/permissões de admin

## Fluxo Recomendado: Security Gates

```
Code → Pre-commit (secrets scan, lint) 
     → PR (code review, SAST)
     → CI (audit, tests, CodeQL)
     → Build (container scan, SBOM)
     → Staging (DAST, pentest)
     → Production (monitoring, WAF, alerts)
```

Cada gate é uma oportunidade de barrar problemas de segurança. O objetivo é que nenhuma vulnerabilidade conhecida chegue à produção.

## Referências OWASP

Consulte em `/sessions/serene-optimistic-galileo/mnt/security_guide_line/site/cheatsheets/`:
- `Docker_Security_Cheat_Sheet.html`
- `CI_CD_Security_Cheat_Sheet.html`
- `NPM_Security_Cheat_Sheet.html`
- `Vulnerable_Dependency_Management_Cheat_Sheet.html`
- `Secrets_Management_Cheat_Sheet.html`
- `Software_Supply_Chain_Security_Cheat_Sheet.html`
- `Infrastructure_as_Code_Security_Cheat_Sheet.html`
- `Logging_Cheat_Sheet.html`
- `Kubernetes_Security_Cheat_Sheet.html`
