// Cache de catálogos por sessão (D8). Dedup por tabela: o 2º pedido na sessão reusa a promise.
// Factory testável (loader injetável). Catálogos são dados de referência sem PII (idênticos a todos).
import { getDomainCatalogFn } from '../../server/domain-catalog.fn'
import type { Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import type { DomainCatalogItem, DomainTable } from '~/shared/domain/domain-catalog'

type CatalogResult = Result<readonly DomainCatalogItem[], AppError>

export function createDomainCache(loader: (t: DomainTable) => Promise<CatalogResult> = getDomainCatalogFn) {
  const cache = new Map<DomainTable, Promise<CatalogResult>>()
  return (table: DomainTable): Promise<CatalogResult> => {
    const hit = cache.get(table)
    if (hit) return hit
    const p = loader(table)
    cache.set(table, p)
    return p
  }
}

// Instância de sessão — os selects das features de escrita (003+) consomem isto via o public-api.
export const domainCatalog = createDomainCache()
