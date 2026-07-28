// Visuais compartilhados das telas de auth (login/recover): ícones de linha + painel de marca.
// Mantém a identidade RORAIMA_DESIGN sem duplicar marcação entre as telas.
import type { JSX } from 'solid-js'
import * as s from './login/login-card.css'

export function Icon(props: { d: string; size?: number }): JSX.Element {
  return (
    <svg width={props.size ?? 18} height={props.size ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d={props.d} />
    </svg>
  )
}

// Paths dos ícones (do design).
export const P = {
  mail: 'M3 5h18v14H3zM4 7l8 6 8-6',
  lock: 'M6 11V8a6 6 0 0 1 12 0v3M4.5 11h15v9.5h-15z',
  eye: 'M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12zM12 14.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z',
  arrow: 'M4 12h15M13 5l7 7-7 7',
  back: 'M20 12H5M11 5l-7 7 7 7',
  check: 'M4 12l5 5 11-11',
  x: 'M6 6l12 12M18 6L6 18',
  shield: 'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z',
  users: 'M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4M15 4.1a3.5 3.5 0 0 1 0 6.8',
  clipboard: 'M9 4h6v3H9zM8 5.5H6.5A1.5 1.5 0 0 0 5 7v12a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V7a1.5 1.5 0 0 0-1.5-1.5H16',
  clock: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16M12 8v4l3 2',
  key: 'M8 14a4 4 0 1 0 3-6.9L20 3M17 6l2 2M14 9l2 2',
}

// Painel de marca (coluna esquerda) — constante nas telas de auth.
export function BrandPanel(): JSX.Element {
  return (
    <aside class={s.brand}>
      <span class={s.brandLogoPlate}>
        <img class={s.brandLogoImg} src="/brand/raros.webp" alt="Raros Boa Vista" />
      </span>
      <div class={s.brandMid}>
        <h1 class={s.brandTitle}>Cuidado, afeto e inclusão.</h1>
        <p class={s.brandText}>
          Plataforma de acompanhamento das famílias atendidas pela Raros Boa Vista — do primeiro contato ao prontuário social contínuo.
        </p>
        <span class={s.brandTag}>
          <Icon d={P.shield} size={15} />
          Acesso restrito à equipe
        </span>
        <div class={s.brandFeatures}>
          <div class={s.brandFeature}>
            <span class={s.brandFeatureIcon}><Icon d={P.users} size={17} /></span>
            Prontuário SUAS centrado na família
          </div>
          <div class={s.brandFeature}>
            <span class={s.brandFeatureIcon}><Icon d={P.clipboard} size={17} /></span>
            Registro assinado e auditável
          </div>
          <div class={s.brandFeature}>
            <span class={s.brandFeatureIcon}><Icon d={P.shield} size={17} /></span>
            Sigilo e conformidade com a LGPD
          </div>
        </div>
      </div>
      <div class={s.brandFoot}>
        Raros Boa Vista · ACDG · Boa Vista — RR
        <br />
        Associação de apoio a doenças genéticas raras
      </div>
    </aside>
  )
}
