// Catálogo i18n (PT-BR) da área de Pessoas (Admin/RH). Tags consumidas pelas views (ADR-0009).
import type { AppErrorKind } from '~/shared/http/app-error'

export const peopleMessages = {
  'people.title': 'Pessoas',
  'people.search.placeholder': 'Buscar por nome',
  'people.new': '+ Nova pessoa',
  'people.empty': 'Nenhuma pessoa cadastrada ainda.',
  'people.empty.filtered': 'Nenhuma pessoa corresponde à busca.',
  'people.retry': 'Tentar novamente',
  'people.active': 'Ativa',
  'people.inactive': 'Inativa',
  // erros de carregamento (lista/detalhe)
  'people.error.generic': 'Não foi possível carregar. Tente novamente.',
  'people.error.forbidden': 'Você não tem permissão para acessar a área de Pessoas.',
  'people.error.unavailable': 'Serviço temporariamente indisponível. Tente novamente.',
  'people.error.notFound': 'Pessoa não encontrada.',
  // campos do formulário
  'people.field.required': 'Campo obrigatório.',
  'people.field.fullName': 'Informe nome e sobrenome.',
  'people.field.cpf': 'CPF inválido.',
  'people.field.date': 'Data inválida.',
  'people.field.dateFuture': 'A data não pode ser futura.',
  'people.field.email': 'E-mail inválido.',
  'people.field.emailRequired': 'E-mail é obrigatório para criar acesso.',
  'people.field.password': 'A senha deve ter ao menos 8 caracteres.',
  // ações — erros de envio
  'people.action.error.conflict': 'Conflito: CPF já cadastrado ou estado incompatível.',
  'people.action.error.validation': 'Há informações inválidas. Revise os campos.',
  'people.action.error.forbidden': 'Você não tem permissão para esta ação.',
  'people.action.error.unavailable': 'Serviço indisponível no momento. Tente novamente.',
  'people.action.error.generic': 'Não foi possível concluir a ação. Tente novamente.',
  // avisos
  'people.warning.idpPending': 'Pessoa criada, mas o acesso (login) ficou pendente — provisione depois.',
} as const

export type PeopleTag = keyof typeof peopleMessages

export const tpe = (tag: PeopleTag): string => peopleMessages[tag]

export function peopleErrorTag(kind: AppErrorKind): PeopleTag {
  switch (kind) {
    case 'forbidden':
      return 'people.error.forbidden'
    case 'notFound':
      return 'people.error.notFound'
    case 'dependencyUnavailable':
    case 'idpUnavailable':
      return 'people.error.unavailable'
    default:
      return 'people.error.generic'
  }
}

export function peopleActionErrorTag(kind: AppErrorKind): PeopleTag {
  switch (kind) {
    case 'conflict':
      return 'people.action.error.conflict'
    case 'validation':
      return 'people.action.error.validation'
    case 'forbidden':
      return 'people.action.error.forbidden'
    case 'dependencyUnavailable':
    case 'idpUnavailable':
      return 'people.action.error.unavailable'
    default:
      return 'people.action.error.generic'
  }
}
