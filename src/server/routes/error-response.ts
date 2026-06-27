// Tradução AppError → (status HTTP, corpo {error}) para as rotas BFF. Não vaza detalhe interno:
// só `code` (estruturado) + `message` = tag semântica (kind). O client reconstrói o kind pelo status.
import type { AppError, AppErrorKind } from '~/shared/http/app-error'

export function statusForKind(kind: AppErrorKind): number {
  switch (kind) {
    case 'unauthorized':
      return 401
    case 'forbidden':
    case 'csrf':
      return 403
    case 'notFound':
      return 404
    case 'conflict':
      return 409
    case 'validation':
      return 422
    case 'state':
      return 400
    case 'idpUnavailable':
    case 'dependencyUnavailable':
      return 503
    case 'unknown':
      return 500
  }
}

export const errorBody = (error: AppError, requestId: string) => ({
  error: { code: error.code, message: error.kind, requestId },
})
