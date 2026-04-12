import type { FC } from "hono/jsx/dom";
import { useState } from "hono/jsx/dom";
import { css, keyframes } from "hono/css";
import { alpha, color, font, radius, weight } from "../../../styles/tokens.ts";

interface ConfirmModalProps {
  readonly type: "approve" | "reject";
  readonly targetLabel: string;
  readonly onConfirm: (reviewNote?: string) => void;
  readonly onCancel: () => void;
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

const overlayStyle = css`
  position: fixed;
  inset: 0;
  background: ${alpha(color.textPrimary, 0.4)};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5000;
  animation: ${fadeIn} 300ms ease;
`;

const boxStyle = css`
  background: ${color.surfaceLight};
  border-radius: ${radius.panel};
  padding: 32px;
  max-width: 440px;
  width: 90%;
  box-shadow: 0 24px 80px ${alpha(color.textPrimary, 0.2)};
  animation: ${fadeInUp} 400ms ease;
`;

const titleStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.semibold};
  font-size: 18px;
  color: ${color.textPrimary};
  margin: 0 0 12px;
`;

const descStyle = css`
  font-family: ${font.playfair};
  font-style: italic;
  font-weight: ${weight.light};
  font-size: 14px;
  color: ${color.textMuted};
  margin: 0 0 20px;
  line-height: 1.5;
`;

const textareaStyle = css`
  width: 100%;
  padding: 12px;
  border: 1px solid ${color.inputLine};
  border-radius: ${radius.dropdown};
  font-family: ${font.satoshi};
  font-weight: ${weight.regular};
  font-size: 14px;
  color: ${color.textPrimary};
  resize: vertical;
  min-height: 80px;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 20px;
  &:focus {
    border-color: ${color.backgroundDark};
  }
  &::placeholder {
    color: ${color.textMuted};
  }
`;

const footerStyle = css`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const cancelBtnStyle = css`
  background: none;
  border: 1px solid ${color.inputLine};
  color: ${color.textMuted};
  padding: 10px 24px;
  border-radius: ${radius.pill};
  font-family: ${font.satoshi};
  font-weight: ${weight.semibold};
  font-size: 13px;
  cursor: pointer;
  transition: all 200ms ease;
  &:hover {
    border-color: ${color.textPrimary};
    color: ${color.textPrimary};
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
  }
`;

const confirmBtnStyle = (variant: "approve" | "reject") =>
  css`
    background: ${variant === "approve" ? color.primary : color.danger};
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: ${radius.pill};
    font-family: ${font.satoshi};
    font-weight: ${weight.semibold};
    font-size: 13px;
    cursor: pointer;
    transition: all 200ms ease;
    &:hover {
      opacity: 0.9;
    }
    &:focus-visible {
      outline: 2px solid ${color.primary};
      outline-offset: 2px;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

export const ConfirmModal: FC<ConfirmModalProps> = (
  { type, targetLabel, onConfirm, onCancel },
) => {
  const [note, setNote] = useState("");

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "Escape") onCancel();
  };

  const handleConfirm = (): void => {
    if (type === "reject") {
      onConfirm(note);
    } else {
      onConfirm();
    }
  };

  return (
    <div class={overlayStyle} onClick={onCancel} onKeyDown={handleKeyDown}>
      <div
        class={boxStyle}
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
        onClick={(e: Event) => e.stopPropagation()}
      >
        <h3 id="modal-title" class={titleStyle}>
          {type === "approve" ? "Aprovar solicitacao" : "Rejeitar solicitacao"}
        </h3>

        {type === "approve"
          ? (
            <p class={descStyle}>
              Deseja aprovar a inclusao do valor "{targetLabel}"? Esta acao ira
              adicionar o valor imediatamente.
            </p>
          )
          : (
            <>
              <p class={descStyle}>
                Informe o motivo da rejeicao. Esta informacao sera enviada ao
                solicitante.
              </p>
              <textarea
                class={textareaStyle}
                placeholder="Motivo da rejeicao (obrigatorio)..."
                value={note}
                // Cast required: Hono's event target is typed as EventTarget, but onInput always fires on HTMLTextAreaElement
                onInput={(e) =>
                  setNote((e.target as HTMLTextAreaElement).value)}
              />
            </>
          )}

        <div class={footerStyle}>
          <button class={cancelBtnStyle} type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button
            class={confirmBtnStyle(type)}
            type="button"
            onClick={handleConfirm}
            disabled={type === "reject" && note.trim().length === 0}
            aria-label={type === "reject"
              ? "Confirmar rejeicao da solicitacao"
              : undefined}
          >
            {type === "approve" ? "Aprovar" : "Rejeitar"}
          </button>
        </div>
      </div>
    </div>
  );
};
