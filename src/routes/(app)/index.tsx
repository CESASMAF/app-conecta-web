// Home protegida "/" — redireciona à área do papel (worker→Pacientes, admin→Pessoas, analyst→Indicadores;
// superadmin→primeira). `deferStream` garante o redirect no SSR (antes do streaming).
import { createAsync, Navigate } from '@solidjs/router'
import { Show } from 'solid-js'
import { getCurrentUserFn } from '~/modules/auth/public-api'
import { rootViewModel } from '~/modules/shell/public-api'

export default function Home() {
  const user = createAsync(() => getCurrentUserFn(), { deferStream: true })
  return (
    <Show when={user()} fallback={<Navigate href="/patients" />}>
      {/* `landingHref` é null quando o papel não alcança área nenhuma. Mandar para /patients
          aí seria mandar para uma rota que o middleware nega, e ele redirigiria de volta:
          quem chega sem papel é atendido pela resposta 403 explicativa do próprio middleware
          — que este Navigate provoca ao tocar /patients uma única vez. */}
      {(u) => <Navigate href={rootViewModel.landingHref(u().groups) ?? '/patients'} />}
    </Show>
  )
}
