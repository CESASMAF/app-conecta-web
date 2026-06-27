# Time de agentes & skills do BFF (web_02)

Time especializado para construir o **server-side completo** do `web_02` (o BFF/facade que cobre os 3 micro-serviços), sempre com o objetivo: **o BFF entrega tudo pronto → o client-side é só tela**.

## Princípio que rege todos
ADR-0010 + adendo 2026-06-25 (`handbook/adr/0010-bff-orchestration-fn-naming.md`): BFF como facade view-ready — composição cross-service, domínio→rótulo no servidor, mutação devolve view-state (não `204`), client nunca compõe/agrega/conhece topologia. Superfície dos backends: `handbook/bff-backend-surface.md`.

## Agentes (`.claude/agents/`)
| Agente | Canto | Escreve código? |
|---|---|---|
| `bff-foundation` | Base: 3 adapter clients, mapa de erro unificado, política de ator por-serviço, AppDeps, stubs | sim |
| `bff-social-care` | Rotas/composições do social-care (Pacientes, Avaliação, Clínico, Proteção, Domínios, Audit) | sim |
| `bff-people-context` | Rotas/composições do people-context (Pessoas, Papéis, Admin) — política `X-Actor-Id` | sim |
| `bff-analysis-bi` | Rotas do analysis-bi (Indicadores/Export/Metadata) + **camada de defesa** (iss/aud+role) | sim |
| `bff-contract-tester` | Contract tests + stubs — a validação executável das regras de negócio | sim (só `tests/`) |
| `facade-guardian` | Revisor adversarial: barra lógica vazando pro client | não (read-only) |

## Skills (`.claude/skills/`)
| Skill | Para quê |
|---|---|
| `bff-add-endpoint` | Receita canônica de uma rota BFF facade (client method → schema → rota → erro → contract test → gates) |
| `bff-compose-view` | Construir uma composição view-ready (fan-out + merge + domínio→rótulo + ações + degradação parcial) |
| `bff-guard-analysis-bi` | A defesa do analysis-bi (validar iss/aud + role antes de encaminhar) |

## Fluxo recomendado do server-side
1. `bff-foundation` monta a base (bloqueia tudo).
2. `bff-social-care` / `bff-people-context` / `bff-analysis-bi` cobrem seus setores (podem ir em paralelo após a base), seguindo `bff-add-endpoint` + `bff-compose-view`.
3. `bff-contract-tester` prova cada rota.
4. `facade-guardian` revisa antes de fechar cada serviço.

## Nota de descoberta
Estes agentes/skills vivem em `web_02/.claude/` (escopo do repo `web_02`). Para usá-los como `subagent_type`/skill, opere no escopo do `web_02`. A fase de **telas** (client) terá seu próprio agente quando o server-side estiver pronto.
