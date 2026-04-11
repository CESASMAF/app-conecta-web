import { css } from "hono/css"
import { color, space, font, weight, radius } from "./tokens.ts"

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
`

export const inputError = css`
  border-bottom-color: ${color.danger};
  &:focus {
    border-bottom-color: ${color.danger};
  }
`

export const inputLabel = css`
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.bold};
  color: ${color.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

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
`

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
`

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
`

export const buttonDisabled = css`
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
`

// --- Card styles ---

export const cardBase = css`
  background: ${color.surface};
  border-radius: ${radius.card};
  padding: ${space[4]};
  transition: box-shadow 0.2s ease;
`

export const cardHover = css`
  &:hover {
    box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);
  }
`

// --- Layout helpers ---

export const stack = css`
  display: flex;
  flex-direction: column;
  gap: ${space[3]};
`

export const row = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${space[3]};
`

export const center = css`
  display: flex;
  align-items: center;
  justify-content: center;
`

// --- Text styles ---

export const textHeading = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.bold};
  color: ${color.textPrimary};
  line-height: 1.2;
`

export const textBody = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.regular};
  font-size: 16px;
  color: ${color.textPrimary};
  line-height: 1.5;
`

export const textCaption = css`
  font-family: ${font.satoshi};
  font-size: 11px;
  color: ${color.textMuted};
  line-height: 1.4;
`

export const textError = css`
  font-family: ${font.satoshi};
  font-size: 11px;
  color: ${color.danger};
  line-height: 1.4;
`

export const textLabel = css`
  font-family: ${font.satoshi};
  font-size: 10px;
  font-weight: ${weight.bold};
  color: ${color.textMuted};
  text-transform: uppercase;
  letter-spacing: 1.5px;
`

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
`
