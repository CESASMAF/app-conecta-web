import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font } from "../../../styles/tokens.ts"

type FamilyNavBarProps = Record<string, never>

const backLink = css`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-family: ${font.satoshi};
  font-size: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);
  color: ${color.textSageMuted};
  text-decoration: none;
  cursor: pointer;
  transition: color 150ms ease;
  margin-bottom: 1.5rem;

  &:hover {
    color: ${color.textSageSecondary};
    text-decoration: underline;
  }
`

export const FamilyNavBar: FC<FamilyNavBarProps> = () => (
  <a href="/social-care" class={backLink} aria-label="Voltar para lista de fam\u00edlias">
    &#8592; Voltar para Fam\u00edlias
  </a>
)
