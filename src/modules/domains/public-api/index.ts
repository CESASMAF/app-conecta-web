// Public API do módulo `domains` — accessor de catálogo (cacheado) p/ os selects das features 003+.
export { domainCatalog, createDomainCache } from '../client/cache/domain-cache'
export { DOMAIN_TABLES, isDomainTable, type DomainTable, type DomainCatalogItem } from '../client/data/domain-catalog.model'
