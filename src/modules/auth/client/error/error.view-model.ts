// ViewModel da tela de erro (ADR-0009) — puro, sem Solid. Traduz a causa que o Kratos
// nomeou em algo que a pessoa entenda E numa saída concreta.
//
// Regra desta tela: toda causa oferece um caminho. Um erro que só diz "deu errado" e não
// diz o que fazer é quase tão ruim quanto o redirect silencioso que ela veio substituir.
import type { FlowErrorKind } from '~/shared/domain/login-flow'

export type ErrorCopy = Readonly<{
  title: string
  text: string
  actionHref: string
  actionLabel: string
  /** true = falha de configuração/infra; a pessoa não resolve tentando de novo. */
  systemic: boolean
}>

const VOLTAR_AO_LOGIN = { actionHref: '/login', actionLabel: 'Voltar ao login' } as const

const COPY: Readonly<Record<FlowErrorKind, ErrorCopy>> = {
  // O que derrubou o login em 2026-08-08. Tentar de novo NÃO resolve — é allowlist do
  // Kratos. Dizemos isso, para a pessoa procurar suporte em vez de insistir.
  returnToForbidden: {
    title: 'Configuração de acesso inconsistente',
    text: 'O provedor de identidade recusou o endereço de retorno. Isso é uma falha de configuração do sistema, não do seu acesso — tentar de novo não vai resolver. Avise a equipe técnica com o código abaixo.',
    systemic: true,
    ...VOLTAR_AO_LOGIN,
  },
  flowExpired: {
    title: 'A sessão de acesso expirou',
    text: 'Você demorou um pouco para concluir e o pedido perdeu a validade. É só começar de novo.',
    systemic: false,
    ...VOLTAR_AO_LOGIN,
  },
  csrf: {
    title: 'Requisição inválida',
    text: 'A verificação de segurança da página falhou — costuma acontecer com uma aba antiga ou cookies bloqueados. Recarregue e tente novamente.',
    systemic: false,
    ...VOLTAR_AO_LOGIN,
  },
  identityMismatch: {
    title: 'Este pedido é de outra conta',
    text: 'O acesso que você tentou concluir pertence a outra sessão. Comece de novo a partir do login.',
    systemic: false,
    ...VOLTAR_AO_LOGIN,
  },
  alreadyLoggedIn: {
    title: 'Você já está conectado',
    text: 'Sua sessão continua ativa — não é preciso entrar de novo.',
    systemic: false,
    actionHref: '/',
    actionLabel: 'Ir para o início',
  },
  unknown: {
    title: 'Não foi possível concluir o acesso',
    text: 'O provedor de identidade recusou a operação. Se acontecer de novo, avise a equipe técnica com o código abaixo.',
    systemic: false,
    ...VOLTAR_AO_LOGIN,
  },
}

export const errorViewModel = {
  copy: (kind: FlowErrorKind): ErrorCopy => COPY[kind],

  // O erro some do Kratos depois de um tempo — chegar aqui com um id velho é comum
  // (recarregar a página, voltar no histórico) e não é uma segunda falha.
  notFoundCopy: (): ErrorCopy => ({
    title: 'Detalhe do erro indisponível',
    text: 'Este código de erro não está mais disponível para consulta. Se o problema persistir, comece o acesso novamente.',
    systemic: false,
    ...VOLTAR_AO_LOGIN,
  }),

  // Alguém digitou /error na barra de endereço. Não houve falha nenhuma.
  missingCopy: (): ErrorCopy => ({
    title: 'Nada para mostrar aqui',
    text: 'Esta página exibe o detalhe de uma falha de acesso e só faz sentido quando o sistema te traz até ela.',
    systemic: false,
    ...VOLTAR_AO_LOGIN,
  }),
}
