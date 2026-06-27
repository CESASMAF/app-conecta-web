// Catálogo i18n (PT-BR) da navegação de pacientes — tags consumidas pelas views (ADR-0009).
// Redação final é da P.O. (@lekadecastro) — placeholders aceitáveis no MVP.
import type { AppErrorKind } from '~/shared/http/app-error'

export const patientsMessages = {
  'patients.empty': 'Nenhum paciente cadastrado ainda.',
  'patients.empty.filtered': 'Nenhum paciente corresponde à busca/filtro.',
  'patients.error.generic': 'Não foi possível carregar os pacientes. Tente novamente.',
  'patients.error.forbidden': 'Você não tem permissão para ver os pacientes.',
  'patients.error.unavailable': 'Serviço temporariamente indisponível. Tente novamente.',
  'patients.retry': 'Tentar novamente',
  'patients.loading': 'Carregando…',
  'patients.search.placeholder': 'Buscar por nome',
  'patients.filter.all': 'Todas as situações',
  // Cadastro (wizard) — erros de campo (validação por passo)
  'register.field.required': 'Campo obrigatório.',
  'register.field.fullName': 'Informe nome e sobrenome.',
  'register.field.cpf': 'CPF inválido.',
  'register.field.date': 'Data inválida.',
  'register.field.dateFuture': 'A data não pode ser futura.',
  'register.relationships.unavailable': 'Não foi possível carregar a lista de parentescos. Tente novamente.',
  // Cadastro — erros do envio (mapeados do kind do BFF)
  'register.error.conflict': 'Já existe um paciente para esta pessoa, ou o CPF já está registrado.',
  'register.error.validation': 'Há informações inválidas. Revise os campos destacados.',
  'register.error.forbidden': 'Você não tem permissão para cadastrar pacientes.',
  'register.error.unavailable': 'Serviço indisponível no momento. Seus dados foram preservados — tente de novo.',
  'register.error.generic': 'Não foi possível concluir o cadastro. Tente novamente.',
  // Ações do Resumo (US3) — campos
  'actions.reason.required': 'Selecione um motivo.',
  'actions.notes.required': 'Descreva o motivo (obrigatório para "Outro").',
  // Avaliação (US4)
  'assessment.field.number': 'Informe um número válido (≥ 0).',
  // Cuidado/Proteção (US5)
  'care.appointment.narrative': 'Informe um resumo ou um plano de ação.',
  'care.empty': 'Nada registrado ainda.',
  'care.error.load': 'Não foi possível carregar. Tente novamente.',
  // Ações do Resumo — erros do envio (mapeados do kind do BFF)
  'actions.error.conflict': 'Esta ação não é válida para a situação atual do paciente.',
  'actions.error.validation': 'Dados inválidos. Revise e tente novamente.',
  'actions.error.forbidden': 'Você não tem permissão para esta ação.',
  'actions.error.unavailable': 'Serviço indisponível no momento. Tente novamente.',
  'actions.error.generic': 'Não foi possível concluir a ação. Tente novamente.',
} as const

export type PatientsTag = keyof typeof patientsMessages

export function patientsErrorTag(kind: AppErrorKind): PatientsTag {
  switch (kind) {
    case 'forbidden':
      return 'patients.error.forbidden'
    case 'dependencyUnavailable':
    case 'idpUnavailable':
      return 'patients.error.unavailable'
    default:
      return 'patients.error.generic'
  }
}

// Mapeia o kind do erro de cadastro (vindo do BFF) para a mensagem de envio do wizard.
export function registerErrorTag(kind: AppErrorKind): PatientsTag {
  switch (kind) {
    case 'conflict':
      return 'register.error.conflict'
    case 'validation':
      return 'register.error.validation'
    case 'forbidden':
      return 'register.error.forbidden'
    case 'dependencyUnavailable':
    case 'idpUnavailable':
      return 'register.error.unavailable'
    default:
      return 'register.error.generic'
  }
}

// Mapeia o kind do erro de uma AÇÃO do Resumo (ciclo de vida/família/identidade) para a mensagem.
export function actionErrorTag(kind: AppErrorKind): PatientsTag {
  switch (kind) {
    case 'conflict':
      return 'actions.error.conflict'
    case 'validation':
      return 'actions.error.validation'
    case 'forbidden':
      return 'actions.error.forbidden'
    case 'dependencyUnavailable':
    case 'idpUnavailable':
      return 'actions.error.unavailable'
    default:
      return 'actions.error.generic'
  }
}

export const tp = (tag: PatientsTag): string => patientsMessages[tag]
