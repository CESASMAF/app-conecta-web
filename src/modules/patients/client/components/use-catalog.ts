// Hooks de catálogo de domínio (cache da 002), prontos para selects. Compartilhados por Avaliação e Cuidado.
import { createMemo } from 'solid-js'
import { createAsync } from '@solidjs/router'
import { domainCatalog, type DomainTable } from '~/modules/domains/public-api'
import { isOk } from '~/shared/http/result'

// Opções {id,label} para SelectField.
export function useCatalogOptions(table: DomainTable) {
  const r = createAsync(() => domainCatalog(table))
  return createMemo(() => {
    const v = r()
    return v && isOk(v) ? v.value.map((i) => ({ id: i.id, label: i.descricao })) : []
  })
}

// Itens crus (com `codigo`) — quando o backend espera o código do enum além do id (ex.: violação).
export function useCatalogItems(table: DomainTable) {
  const r = createAsync(() => domainCatalog(table))
  return createMemo(() => {
    const v = r()
    return v && isOk(v) ? v.value : []
  })
}
