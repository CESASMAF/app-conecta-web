// Defesa do BFF para o analysis-bi (skill bff-guard-analysis-bi). O backend pode rodar SEM RBAC e SEM
// validar iss/aud (HIGH-001/002/003 em handbook/bff-backend-surface.md), então o BFF é a AUTORIDADE de
// acesso: enforça o papel ANTES de encaminhar. iss/aud já é garantido pela sessão (login OIDC Authentik).
import { appError, type AppError } from '~/shared/http/app-error'
import { ok, err, type Result } from '~/shared/http/result'
import { hasRole } from '~/shared/auth/roles'

const SYSTEM = 'analysis-bi'

export type AnalysisBiResource = 'indicators' | 'export' | 'metadata'

// Autoriza acesso a um recurso do analysis-bi a partir dos `groups` da sessão.
// indicators → `analyst`; export → `exporter`; metadata → qualquer autenticado.
// Devolve `forbidden` (sem o papel) — a rota NÃO encaminha ao upstream nesse caso.
export function authorizeAnalysisBi(
  groups: readonly string[],
  resource: AnalysisBiResource,
): Result<void, AppError> {
  if (resource === 'metadata') return ok(undefined)
  const role = resource === 'export' ? 'exporter' : 'analyst'
  if (hasRole(groups, SYSTEM, role)) return ok(undefined)
  return err(appError('forbidden', `ABI-${role.toUpperCase()}-REQUIRED`))
}
