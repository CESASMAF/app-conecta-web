// Contrato de design tokens (ADR-0007) — portado do DS RAROS web_02 (OKLCH, Atkinson, 4px grid).
// UI referencia SOMENTE `vars.*` (token-only); hex/px cru no UI = erro de governance test.
import { createGlobalTheme } from '@vanilla-extract/css'

export const vars = createGlobalTheme(':root', {
  color: {
    bg: {
      primary: 'oklch(98.5% 0.003 70)', // warmgray-50 — fundo do app
      secondary: 'oklch(97% 0.004 70)', // warmgray-100 — sunken/rail
      elevated: '#ffffff', // cards, sheets, menus
    },
    text: {
      primary: 'oklch(24% 0.008 70)', // warmgray-900
      secondary: 'oklch(52% 0.011 70)', // warmgray-600
      disabled: 'oklch(72% 0.009 70)', // warmgray-400
      onPrimary: '#ffffff',
    },
    action: {
      primary: '#703cc0', // RAROS roxo — âncora da marca (Raros Boa Vista, brand-identity.md)
      hover: '#5b2ea0', // RAROS roxo-escuro (hover do roxo)
      active: '#4a2585', // roxo pressionado
      fg: '#ffffff',
      tint: '#ede4fb', // RAROS roxo-claro (botão tonal / badge de situação)
      tintFg: '#703cc0',
    },
    border: {
      default: 'oklch(93% 0.006 70)', // warmgray-200
      strong: 'oklch(72% 0.009 70)', // warmgray-400
      active: '#703cc0', // RAROS roxo
    },
    focus: '#703cc0', // RAROS roxo — anel de foco WCAG 2.2 AA
    danger: 'oklch(52% 0.200 25)',
    dangerBg: 'oklch(96% 0.02 25)',
    dangerBorder: 'oklch(58% 0.210 25)',
    success: 'oklch(55% 0.145 150)',
    warning: 'oklch(56% 0.150 65)',
    info: 'oklch(54% 0.145 245)',
    brand: { gradient: 'linear-gradient(135deg, #703cc0, #9618ba 45%, #267ce8)' }, // gradiente da marca (CTAs)
  },
  font: {
    // Atkinson Hyperlegible (hiperlegibilidade = valor de produto). Self-host .woff2 em prod (ADR-0008).
    sans: "'Atkinson Hyperlegible Next', 'Atkinson Hyperlegible', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    mono: "'Atkinson Hyperlegible Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  },
  text: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    xxl: '1.5rem', // page titles
    xxxl: '1.875rem', // KPI
    hero: '2.25rem',
  },
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
  leading: { tight: '1.2', snug: '1.35', normal: '1.5', relaxed: '1.65' },
  tracking: { tight: '-0.01em', normal: '0', wide: '0.02em', caps: '0.06em' },
  space: {
    none: '0',
    xs: '4px', // space-1
    sm: '8px', // space-2
    md: '12px', // space-3
    lg: '16px', // space-4
    xl: '24px', // space-6
    xxl: '32px', // space-8
    xxxl: '48px', // space-12
  },
  radius: { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '28px', full: '9999px' },
  border: { hairline: '1px', strong: '2px' },
  focusRing: { width: '2px', offset: '1px' },
  shadow: {
    xs: '0 1px 2px oklch(24% 0.008 70 / 0.06)',
    sm: '0 1px 2px oklch(24% 0.008 70 / 0.08), 0 1px 3px oklch(24% 0.008 70 / 0.06)',
    md: '0 2px 4px oklch(24% 0.008 70 / 0.07), 0 6px 16px oklch(24% 0.008 70 / 0.09)',
    lg: '0 8px 24px oklch(24% 0.008 70 / 0.12), 0 2px 6px oklch(24% 0.008 70 / 0.08)',
  },
  layout: { contentMax: '1200px', railWidth: '72px', topbarHeight: '64px' },
  motion: { fast: '120ms', normal: '200ms', ease: 'cubic-bezier(0.2, 0, 0, 1)' },
})
