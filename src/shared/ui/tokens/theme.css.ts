// Contrato de design tokens (ADR-0007) — alinhado ao protótipo hi-fi RORAIMA_DESIGN (Raros Boa Vista).
// UI referencia SOMENTE `vars.*` (token-only); hex/px cru no UI = erro de governance test.
// Neutros = slate cool do protótipo; acentos + tints + status derivam de `wf-styles.css :root`.
import { createGlobalTheme } from '@vanilla-extract/css'

export const vars = createGlobalTheme(':root', {
  color: {
    bg: {
      primary: '#f3f4f6', // --bg (fundo do app)
      secondary: '#fbfbfc', // rail / superfície sutil
      elevated: '#ffffff', // cards, sheets, menus (--card)
      sunken: '#eef0f3', // --line-soft (tracks, th, fills rebaixados)
    },
    text: {
      primary: '#111827', // --ink (títulos, nomes, valores em destaque)
      body: '#374151', // --body (texto corrido padrão)
      secondary: '#6b7280', // --muted (metadados, legendas)
      disabled: '#9aa3af', // --faint (placeholders, micro-rótulos)
      onPrimary: '#ffffff',
    },
    action: {
      primary: '#703cc0', // RAROS roxo — âncora da marca (--purple)
      hover: '#5b2ea0', // roxo-escuro (--blue-dark)
      active: '#4a2585', // roxo pressionado
      fg: '#ffffff',
      tint: '#ede4fb', // roxo-claro (botão tonal / badge) — --tec-bg
      tintFg: '#703cc0',
    },
    border: {
      default: '#e8eaee', // --line
      soft: '#eef0f3', // --line-soft (divisórias leves)
      strong: '#9aa3af', // --faint
      active: '#703cc0', // RAROS roxo
    },
    focus: '#703cc0', // anel de foco WCAG 2.2 AA
    // Acentos da marca (cor = significado; ver §7 Modo Enxuto do handoff)
    accent: {
      magenta: '#9618ba',
      turquoise: '#00c2d1',
      blue: '#267ce8',
      blueDark: '#5b2ea0',
      orange: '#ea580c',
      green: '#16a34a',
    },
    // Tints de categoria (fundos suaves)
    tint: {
      news: '#dbeafe',
      tec: '#ede4fb',
      saude: '#cdf6f9',
      tut: '#f3def8',
      eventos: '#ffedd5',
    },
    // Cores de status (chip/badge): fg + bg + border por significado
    status: {
      acolhidoFg: '#16a34a',
      acolhidoBg: '#ecfdf3',
      acolhidoBorder: 'color-mix(in srgb, #16a34a 45%, #fff)',
      filaFg: '#ea580c',
      filaBg: '#fff7ed',
      filaBorder: 'color-mix(in srgb, #ea580c 45%, #fff)',
      altaFg: '#267ce8',
      altaBg: '#dbeafe',
      altaBorder: 'color-mix(in srgb, #267ce8 45%, #fff)',
      riscoFg: '#dc2626',
      riscoBg: '#fef2f2',
      riscoBorder: '#fecaca',
      saudeFg: '#0e8a96',
      saudeBg: '#cdf6f9',
      saudeBorder: 'color-mix(in srgb, #00c2d1 40%, #fff)',
      tecFg: '#703cc0',
      tecBg: '#ede4fb',
      tecBorder: 'color-mix(in srgb, #703cc0 35%, #fff)',
      tutFg: '#9618ba',
      tutBg: '#f3def8',
      tutBorder: 'color-mix(in srgb, #9618ba 35%, #fff)',
    },
    danger: '#dc2626',
    dangerBg: '#fef2f2',
    dangerBorder: '#fecaca',
    success: '#16a34a',
    warning: '#ea580c',
    info: '#267ce8',
    brand: { gradient: 'linear-gradient(135deg, #703cc0, #9618ba 45%, #267ce8)' }, // gradiente da marca (CTAs)
  },
  font: {
    // Atkinson Hyperlegible (hiperlegibilidade = valor de produto). Self-host .woff2 em prod (ADR-0008).
    // Decisão do app: Atkinson para tudo (títulos e códigos) — Poppins/JetBrains só no site.
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
  radius: { xs: '4px', sm: '8px', md: '12px', card: '14px', lg: '16px', xl: '28px', full: '9999px' },
  border: { hairline: '1px', strong: '2px' },
  focusRing: { width: '2px', offset: '1px' },
  shadow: {
    // slate cool (rgba(16,24,40,…)) — casa com o protótipo. No Modo Enxuto, usar hairline antes de sombra.
    xs: '0 1px 2px rgba(16, 24, 40, 0.05)',
    sm: '0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.05)',
    md: '0 8px 24px rgba(16, 24, 40, 0.08)',
    lg: '0 18px 50px rgba(15, 23, 42, 0.14)',
  },
  layout: { contentMax: '1180px', railWidth: '224px', topbarHeight: '64px' },
  motion: { fast: '120ms', normal: '160ms', ease: 'cubic-bezier(0.2, 0, 0, 1)' },
})
