// Rota pública /error → detalhe de uma falha de fluxo do Kratos (importa via public-api, ADR-0001).
// É para cá que o Kratos manda o browser quando recusa um fluxo (`?id=<uuid>`).
import { ErrorPage } from '~/modules/auth/public-api'

export default function Error() {
  return <ErrorPage />
}
