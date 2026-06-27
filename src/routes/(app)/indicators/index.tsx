// Rota "/indicators" — painel de Indicadores (Donos · analysis-bi). Protegida (guard 001); papel analyst no BFF.
import { IndicatorsPage } from '~/modules/indicators/public-api'

export default function IndicatorsRoute() {
  return <IndicatorsPage />
}
