// Tipos de catálogo de domínio — COMPARTILHADOS entre BFF e client. PUROS. Allowlist das 13 tabelas.
export const DOMAIN_TABLES = [
  'dominio_tipo_identidade',
  'dominio_parentesco',
  'dominio_condicao_ocupacao',
  'dominio_escolaridade',
  'dominio_efeito_condicionalidade',
  'dominio_tipo_deficiencia',
  'dominio_programa_social',
  'dominio_tipo_ingresso',
  'dominio_tipo_beneficio',
  'dominio_tipo_violacao',
  'dominio_servico_vinculo',
  'dominio_tipo_medida',
  'dominio_unidade_realizacao',
] as const

export type DomainTable = (typeof DOMAIN_TABLES)[number]

export const isDomainTable = (v: string): v is DomainTable =>
  (DOMAIN_TABLES as readonly string[]).includes(v)

export type DomainCatalogItem = Readonly<{ id: string; codigo: string; descricao: string }>
