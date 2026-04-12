import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
import { alpha, color, font, radius, weight } from "../../../styles/tokens.ts";
import type { AdminTab } from "./types.ts";

interface AdminTabBarProps {
  readonly activeTab: AdminTab;
  readonly pendingCount: number;
  readonly onTabChange: (tab: AdminTab) => void;
}

interface TabButtonProps {
  readonly label: string;
  readonly tab: AdminTab;
  readonly isActive: boolean;
  readonly badge?: number;
  readonly onClick: () => void;
  readonly ariaLabel?: string;
}

const navStyle = css`
  background: ${color.surface};
  padding: 0 20px;
  border-bottom: 1px solid ${color.inputLine};
  display: flex;
  gap: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  @media (min-width: 600px) {
    padding: 0 48px;
    overflow-x: visible;
  }
`;

const tabBtnStyle = (active: boolean) =>
  css`
    padding: 14px 24px;
    border: none;
    border-bottom: 2px solid ${active ? color.backgroundDark : "transparent"};
    background: ${active ? alpha(color.backgroundDark, 0.06) : "none"};
    font-family: ${font.satoshi};
    font-weight: ${weight.semibold};
    font-size: 12px;
    letter-spacing: 0.3px;
    color: ${active ? color.textPrimary : color.textMuted};
    cursor: pointer;
    transition: all 200ms ease;
    white-space: nowrap;
    &:hover {
      color: ${color.textPrimary};
    }
    &:focus-visible {
      outline: 2px solid ${color.primary};
      outline-offset: 2px;
    }
    @media (min-width: 600px) {
      font-size: 13px;
    }
  `;

const badgeStyle = css`
  background: ${color.danger};
  color: white;
  font-family: ${font.satoshi};
  font-weight: ${weight.bold};
  font-size: 10px;
  padding: 2px 6px;
  border-radius: ${radius.pill};
  margin-left: 6px;
`;

const TabButton: FC<TabButtonProps> = (
  { label, isActive, badge, onClick, ariaLabel },
) => (
  <button
    class={tabBtnStyle(isActive)}
    role="tab"
    aria-selected={isActive}
    aria-label={ariaLabel}
    type="button"
    onClick={onClick}
  >
    {label}
    {badge !== undefined && badge > 0 && (
      <span class={badgeStyle} aria-hidden="true">{badge}</span>
    )}
  </button>
);

const TABS: readonly { tab: AdminTab; label: string }[] = [
  { tab: "dashboard", label: "Dashboard" },
  { tab: "pessoas", label: "Pessoas" },
  { tab: "lookups", label: "Lookup Tables" },
  { tab: "solicitacoes", label: "Solicitacoes" },
  { tab: "auditoria", label: "Auditoria" },
];

export const AdminTabBar: FC<AdminTabBarProps> = (
  { activeTab, pendingCount, onTabChange },
) => (
  <nav role="tablist" aria-label="Secoes do admin" class={navStyle}>
    {TABS.map(({ tab, label }) => (
      <TabButton
        key={tab}
        tab={tab}
        label={label}
        isActive={activeTab === tab}
        badge={tab === "solicitacoes" ? pendingCount : undefined}
        ariaLabel={tab === "solicitacoes" && pendingCount > 0
          ? `Solicitacoes, ${pendingCount} pendentes`
          : undefined}
        onClick={() => onTabChange(tab)}
      />
    ))}
  </nav>
);
