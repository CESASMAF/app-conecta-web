import { css } from "hono/css";

// --- Colors ---

export const color = {
  // Backgrounds
  background: "#F2E2C4",
  backgroundDark: "#172D48",
  surface: "#FAF0E0",
  surfaceLight: "#FFFBF4",
  cardAlternate: "#C8BBA4",

  // Text
  textPrimary: "#261D11",
  textOnDark: "#F2E2C4",
  textMuted: "rgba(38, 29, 17, 0.5)",
  antiFlash: "#EBEBEB",

  // Semantic
  primary: "#4F8448",
  danger: "#A6290D",
  warning: "#C9960A",

  // Borders
  inputLine: "rgba(38, 29, 17, 0.2)",
  borderOnDark: "#F2E2C4",
} as const;

// Helper: apply alpha to any hex color
export const alpha = (hex: string, a: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

// --- Typography ---

export const font = {
  satoshi: "'Satoshi', sans-serif",
  playfair: "'Playfair Display', serif",
  erode: "'Erode', serif",
} as const;

export const weight = {
  light: "300",
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

// --- Spacing ---

export const space = {
  1: "4px",
  2: "8px",
  3: "16px",
  4: "24px",
  5: "32px",
  6: "40px",
  7: "48px",
  8: "56px",
  9: "64px",
  10: "72px",
} as const;

// --- Shadows ---

export const shadow = {
  button: css`
    box-shadow:
      2.5px 2.5px 5px 2px rgba(0, 0, 0, 0.12),
      -1px -1px 4px rgba(0, 0, 0, 0.06);
  `,
  panel: css`
    box-shadow: -8px 0 40px ${alpha(color.textPrimary, 0.3)};
  `,
  fab: css`
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  `,
  dialog: css`
    box-shadow: 0 24px 80px ${color.inputLine};
  `,
  modal: css`
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.04),
      -9px 9px 9px -0.5px rgba(0, 0, 0, 0.04),
      -18px 18px 18px -1.5px rgba(0, 0, 0, 0.08),
      -37px 37px 37px -3px rgba(0, 0, 0, 0.16),
      -75px 75px 75px -6px rgba(0, 0, 0, 0.24),
      -150px 150px 150px -12px rgba(0, 0, 0, 0.48);
  `,
} as const;

// --- Border Radius ---

export const radius = {
  pill: "100px",
  panel: "24px",
  card: "12px",
  dropdown: "8px",
  modal: "6px",
  checkbox: "4px",
  small: "3px",
} as const;

// --- Breakpoints ---

export const breakpoint = {
  mobile: 600,
  tablet: 1200,
} as const;

export const isMobile = (): boolean => window.innerWidth < breakpoint.mobile;
export const isTablet = (): boolean =>
  window.innerWidth >= breakpoint.mobile &&
  window.innerWidth < breakpoint.tablet;
export const isDesktop = (): boolean => window.innerWidth >= breakpoint.tablet;

// --- Sage Garden Design System ---

export const sage = {
  // Backgrounds
  bgBase: "#F8F3EC",
  bgWarm: "#F0E8DC",
  bgSage: "#E2E8DF",
  bgSageDeep: "#D4DDD0",
  bgCard: "rgba(255,255,255,0.45)",
  bgCardHover: "rgba(255,255,255,0.65)",
  bgCardBorder: "rgba(255,255,255,0.6)",
  bgCardBorderHover: "rgba(79,132,72,0.2)",

  // Text
  textPrimary: "#1E2B1A",
  textSecondary: "#3D5235",
  textMuted: "#6B7F65",
  textSoft: "#8B9E85",
  // A11y-corrected label color (passes 4.5:1 on card bg)
  textLabel: "#5A7154",

  // Green palette
  greenPrimary: "#4F8448",
  greenDark: "#3D6A37",
  greenLight: "rgba(79,132,72,0.08)",

  // Semantic
  danger: "#C4422B",
  dangerLight: "rgba(196,66,43,0.08)",
  dangerBorder: "rgba(196,66,43,0.15)",

  // Input
  inputBorder: "rgba(79,132,72,0.15)",
  inputBorderFilled: "rgba(79,132,72,0.3)",

  // Shadows
  cardShadow: "0 2px 12px rgba(0,0,0,0.04)",
  buttonShadow: "0 2px 12px rgba(79,132,72,0.2)",
  buttonShadowHover: "0 4px 20px rgba(79,132,72,0.3)",
  successCircleShadow: "0 4px 20px rgba(79,132,72,0.25)",
  overlayShadow: "0 8px 40px rgba(0,0,0,0.06)",
} as const;

// --- Sage Garden Radius Extensions ---

export const sageRadius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
} as const;

// --- Sage Garden Easing ---

export const easing = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;
