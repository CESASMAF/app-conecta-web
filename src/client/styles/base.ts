import { css, keyframes } from "hono/css";
import {
  color,
  easing,
  font,
  radius,
  sage,
  sageRadius,
  space,
  weight,
} from "./tokens.ts";

// --- Input styles ---

export const inputBase = css`
  border: none;
  border-bottom: 2px solid ${color.inputLine};
  background: transparent;
  padding: ${space[2]} 0;
  font-family: ${font.erode};
  font-size: 16px;
  font-weight: ${weight.regular};
  color: ${color.textPrimary};
  outline: none;
  width: 100%;
  transition: border-color 0.2s ease;
  &:focus {
    border-bottom-color: ${color.primary};
  }
`;

export const inputError = css`
  border-bottom-color: ${color.danger};
  &:focus {
    border-bottom-color: ${color.danger};
  }
`;

export const inputLabel = css`
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.bold};
  color: ${color.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

// --- Button styles ---

export const buttonPrimary = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${color.primary};
  color: ${color.surfaceLight};
  font-family: ${font.erode};
  font-size: 16px;
  font-weight: ${weight.medium};
  border: none;
  border-radius: ${radius.pill};
  padding: ${space[3]} ${space[5]};
  cursor: pointer;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 0.9;
  }
  &:active {
    opacity: 0.8;
  }
`;

export const buttonSecondary = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${color.primary};
  font-family: ${font.erode};
  font-size: 16px;
  font-weight: ${weight.medium};
  border: 2px solid ${color.primary};
  border-radius: ${radius.pill};
  padding: ${space[3]} ${space[5]};
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  &:hover {
    background: ${color.primary};
    color: ${color.surfaceLight};
  }
`;

export const buttonDanger = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${color.danger};
  color: ${color.surfaceLight};
  font-family: ${font.erode};
  font-size: 16px;
  font-weight: ${weight.medium};
  border: none;
  border-radius: ${radius.pill};
  padding: ${space[3]} ${space[5]};
  cursor: pointer;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 0.9;
  }
`;

export const buttonDisabled = css`
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
`;

// --- Card styles ---

export const cardBase = css`
  background: ${color.surface};
  border-radius: ${radius.card};
  padding: ${space[4]};
  transition: box-shadow 0.2s ease;
`;

export const cardHover = css`
  &:hover {
    box-shadow:
      2.5px 2.5px 5px 2px rgba(0, 0, 0, 0.12),
      -1px -1px 4px rgba(0, 0, 0, 0.06);
    }
  `;

  // --- Layout helpers ---

  export const stack = css`
    display: flex;
    flex-direction: column;
    gap: ${space[3]};
  `;

  export const row = css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${space[3]};
  `;

  export const center = css`
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  // --- Text styles ---

  export const textHeading = css`
    font-family: ${font.satoshi};
    font-weight: ${weight.bold};
    color: ${color.textPrimary};
    line-height: 1.2;
  `;

  export const textBody = css`
    font-family: ${font.satoshi};
    font-weight: ${weight.regular};
    font-size: 16px;
    color: ${color.textPrimary};
    line-height: 1.5;
  `;

  export const textCaption = css`
    font-family: ${font.satoshi};
    font-size: 11px;
    color: ${color.textMuted};
    line-height: 1.4;
  `;

  export const textError = css`
    font-family: ${font.satoshi};
    font-size: 11px;
    color: ${color.danger};
    line-height: 1.4;
  `;

  export const textLabel = css`
    font-family: ${font.satoshi};
    font-size: 10px;
    font-weight: ${weight.bold};
    color: ${color.textMuted};
    text-transform: uppercase;
    letter-spacing: 1.5px;
  `;

  // --- Page layout ---

  export const pageContainer = css`
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: ${space[4]} 48px;

    @media (max-width: 1200px) {
      padding: ${space[4]} 40px;
    }

    @media (max-width: 600px) {
      padding: ${space[3]} 20px;
    }
  `;

  // =====================================================
  // Sage Garden Design System — Base Styles
  // =====================================================

  // --- Sage Garden Input ---

  export const sageInputBase = css`
    border: none;
    border-bottom: 1.5px solid ${sage.inputBorder};
    background: transparent;
    padding: 10px 0;
    font-family: ${font.satoshi};
    font-size: 15px;
    font-weight: ${weight.regular};
    color: ${sage.textPrimary};
    outline: none;
    width: 100%;
    transition: border-color 0.2s ease;
    &:focus {
      border-bottom-color: ${sage.greenPrimary};
    }
    &::placeholder {
      color: ${sage.textSoft};
      font-style: italic;
    }
  `;

  export const sageInputError = css`
    border-bottom-color: ${sage.danger};
    &:focus {
      border-bottom-color: ${sage.danger};
    }
  `;

  export const sageInputLabel = css`
    font-family: ${font.satoshi};
    font-size: 12px;
    font-weight: ${weight.semibold};
    color: ${sage.textLabel};
    text-transform: uppercase;
    letter-spacing: 1px;
  `;

  // --- Sage Garden Buttons ---

  export const sageButtonPrimary = css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, ${sage.greenPrimary}, ${sage
      .greenDark});
    color: white;
    font-family: ${font.satoshi};
    font-size: 14px;
    font-weight: ${weight.semibold};
    border: none;
    border-radius: 100px;
    padding: 12px 28px;
    cursor: pointer;
    box-shadow: ${sage.buttonShadow};
    transition: transform 0.2s ${easing.out}, box-shadow 0.2s ${easing.out};
    &:hover {
      transform: translateY(-1px);
      box-shadow: ${sage.buttonShadowHover};
    }
    &:active {
      transform: translateY(0);
    }
    &:focus-visible {
      outline: 2px solid ${sage.greenPrimary};
      outline-offset: 2px;
    }
  `;

  export const sageButtonSecondary = css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: ${sage.textMuted};
    font-family: ${font.satoshi};
    font-size: 14px;
    font-weight: ${weight.semibold};
    border: 1.5px solid rgba(79, 132, 72, 0.2);
    border-radius: 100px;
    padding: 10px 20px;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;
    &:hover {
      border-color: rgba(79, 132, 72, 0.4);
      color: ${sage.textSecondary};
    }
    &:focus-visible {
      outline: 2px solid ${sage.greenPrimary};
      outline-offset: 2px;
    }
  `;

  export const sageButtonDisabled = css`
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  `;

  // --- Sage Garden Cards ---

  export const sageCard = css`
    background: ${sage.bgCard};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${sage.bgCardBorder};
    border-radius: ${sageRadius.xl};
    padding: ${space[5]};
    box-shadow: ${sage.cardShadow};
  `;

  export const sageCardHover = css`
    transition: border-color 0.2s ease, background 0.2s ease;
    &:hover {
      background: ${sage.bgCardHover};
      border-color: ${sage.bgCardBorderHover};
    }
  `;

  // --- Sage Garden Glass Diagnosis Card ---

  export const sageDiagnosisCard = css`
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: ${sageRadius.lg};
    padding: ${space[5]};
    position: relative;
  `;

  export const sageDiagnosisCardComplete = css`
    border-color: rgba(79, 132, 72, 0.3);
    background: rgba(79, 132, 72, 0.04);
  `;

  // --- Sage Garden Text Styles ---

  export const sageTextHeading = css`
    font-family: ${font.erode};
    font-weight: ${weight.bold};
    color: ${sage.textPrimary};
    line-height: 1.2;
  `;

  export const sageTextBody = css`
    font-family: ${font.satoshi};
    font-weight: ${weight.regular};
    font-size: 15px;
    color: ${sage.textPrimary};
    line-height: 1.5;
  `;

  export const sageTextMuted = css`
    font-family: ${font.satoshi};
    font-size: 14px;
    color: ${sage.textMuted};
    line-height: 1.5;
  `;

  export const sageTextError = css`
    font-family: ${font.satoshi};
    font-size: 12.5px;
    color: ${sage.danger};
    margin-top: 4px;
  `;

  // --- Sage Garden Keyframes ---

  export const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

  export const containerFadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

  export const bannerSlide = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
`;

  export const successScale = keyframes`
  0% { transform: scale(0); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

  export const checkDraw = keyframes`
  to { stroke-dashoffset: 0; }
`;

  export const successIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

  // --- Sage Garden Layout ---

  export const sageFormGrid = css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px 24px;
    @media (max-width: 600px) {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  `;

  export const sageFullWidth = css`
    grid-column: 1 / -1;
  `;
