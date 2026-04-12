import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
import {
  easing,
  font,
  sage,
  sageRadius,
  weight,
} from "../../../styles/tokens.ts";

interface WizardTopBarProps {
  readonly backHref?: string;
  readonly draftSaved?: boolean;
}

const barStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
`;

const backLinkStyle = css`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: ${font.satoshi};
  font-size: 14px;
  font-weight: ${weight.medium};
  color: ${sage.textMuted};
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ${easing.out};
  &:hover {
    color: ${sage.textSecondary};
  }
  &:focus-visible {
    outline: 2px solid ${sage.greenPrimary};
    outline-offset: 2px;
    border-radius: ${sageRadius.sm};
  }
`;

const draftIndicatorStyle = css`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: ${font.satoshi};
  font-size: 12px;
  font-weight: ${weight.medium};
  color: ${sage.textSoft};
`;

const draftDotStyle = css`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${sage.greenPrimary};
`;

export const WizardTopBar: FC<WizardTopBarProps> = ({
  backHref = "/social-care",
  draftSaved = false,
}) => (
  <div class={barStyle}>
    <a href={backHref} class={backLinkStyle} aria-label="Voltar para Familias">
      <span aria-hidden="true">&larr;</span>
      Voltar para Familias
    </a>
    {draftSaved && (
      <span class={draftIndicatorStyle}>
        <span class={draftDotStyle} aria-hidden="true" />
        Rascunho salvo automaticamente
      </span>
    )}
  </div>
);
