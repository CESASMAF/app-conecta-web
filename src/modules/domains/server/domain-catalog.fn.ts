'use server'
// Server function (D11) do catálogo: lê um domínio via app.handle (SSR-safe, sem leak).
import { getRequestEvent } from 'solid-js/web'
import { app } from '~/server/app'
import { ok, err, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import { toUpstreamError } from '~/shared/http/upstream-error'
import type { DomainCatalogItem, DomainTable } from '~/shared/domain/domain-catalog'

export async function getDomainCatalogFn(table: DomainTable): Promise<Result<readonly DomainCatalogItem[], AppError>> {
  const cookie = getRequestEvent()?.request.headers.get('cookie') ?? ''
  const res = await app.handle(new Request(`http://internal/api/domains/${table}`, { headers: { cookie } }))
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    /* corpo vazio/não-JSON */
  }
  if (!res.ok) return err(toUpstreamError(res.status, body))
  return ok((body as { data: readonly DomainCatalogItem[] }).data)
}
