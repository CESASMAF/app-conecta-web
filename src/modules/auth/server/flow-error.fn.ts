'use server'
// Server function (ADR-0009): busca no Kratos o detalhe do erro de fluxo. Roda SÓ no
// servidor — a Public API do Kratos é interna (app-net), o browser não a alcança.
import { fetchFlowError } from '~/server/kratos'
import type { FlowErrorResult } from '~/shared/domain/login-flow'

export async function getFlowErrorFn(errorId: string | null): Promise<FlowErrorResult> {
  // Sem `?id=` foi acesso direto à URL, não um redirect do Kratos. Não é erro nenhum:
  // a tela convida a voltar ao login em vez de inventar uma falha.
  if (!errorId) return { kind: 'missing' }
  return fetchFlowError(errorId)
}
