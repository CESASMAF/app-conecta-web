import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"

interface FamilyNavBarProps {
  readonly lastName: string
}

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
  margin-bottom: ${color.textSageMuted ? "1.5rem" : "1.5rem"};

  &:hover {
    color: ${color.textSageSecondary};
    text-decoration: underline;
  }
`

export const FamilyNavBar: FC<FamilyNavBarProps> = ({ lastName }) => (
  <a href="/social-care" class={backLink} aria-label="Voltar para lista de familias">
    &#8592; Voltar para Familias
  </a>
)
