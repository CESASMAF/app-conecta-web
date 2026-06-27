// Base global (reset mínimo wired aos tokens) — DS RAROS web_02. Importado uma vez (em app.tsx).
import { globalStyle } from '@vanilla-extract/css'
import './tokens/fonts.css' // @font-face self-hosted (ADR-0008) — declara as famílias antes do uso
import { vars } from './tokens/theme.css'

globalStyle('*, *::before, *::after', { boxSizing: 'border-box' })

globalStyle('html', { WebkitTextSizeAdjust: '100%' })

globalStyle('body', {
  margin: 0,
  fontFamily: vars.font.sans,
  fontSize: vars.text.base,
  lineHeight: vars.leading.normal,
  fontWeight: vars.weight.regular,
  color: vars.color.text.primary,
  background: vars.color.bg.primary,
  WebkitFontSmoothing: 'antialiased',
  textRendering: 'optimizeLegibility',
})

globalStyle('h1, h2, h3, h4', {
  margin: 0,
  lineHeight: vars.leading.tight,
  fontWeight: vars.weight.bold,
  letterSpacing: vars.tracking.tight,
  color: vars.color.text.primary,
})

globalStyle('p', { margin: 0 })
globalStyle('code, kbd, samp', { fontFamily: vars.font.mono })
globalStyle('a', { color: vars.color.action.primary, textUnderlineOffset: '2px' })

// Foco SEMPRE visível — acessibilidade é o valor da marca (WCAG 2.2 AA).
globalStyle(':where(a, button, input, select, textarea, [tabindex]):focus-visible', {
  outline: `${vars.focusRing.width} solid ${vars.color.focus}`,
  outlineOffset: vars.focusRing.offset,
  borderRadius: vars.radius.xs,
})

// Movimento calmo; respeita prefers-reduced-motion.
globalStyle('*, *::before, *::after', {
  '@media': { '(prefers-reduced-motion: reduce)': { animationDuration: '0.001ms !important', transitionDuration: '0.001ms !important' } },
})
