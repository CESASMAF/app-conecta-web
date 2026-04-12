import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
import {
  easing,
  font,
  sage,
  sageRadius,
  weight,
} from "../../../styles/tokens.ts";

type NavItem = "familias" | "cadastro" | "relatorios" | "config";

interface SidebarProps {
  readonly activeItem: NavItem;
  readonly userName?: string;
  readonly userInitials?: string;
}

const NAV_ITEMS: readonly {
  readonly id: NavItem;
  readonly icon: string;
  readonly label: string;
}[] = [
  { id: "familias", icon: "\uD83C\uDFE0", label: "Familias" },
  { id: "cadastro", icon: "\u2795", label: "Cadastro" },
  { id: "relatorios", icon: "\uD83D\uDCCA", label: "Relatorios" },
  { id: "config", icon: "\u2699\uFE0F", label: "Configuracoes" },
] as const;

const sidebarStyle = css`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 64px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(79, 132, 72, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  z-index: 100;
  overflow: hidden;
  transition: width 300ms ${easing.out};
  &:hover {
    width: 220px;
  }
  @media (max-width: 600px) {
    display: none;
  }
`;

const navStyle = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  flex: 1;
  padding: 0 10px;
  margin-top: 24px;
`;

const navItemStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: ${sageRadius.sm};
  font-family: ${font.satoshi};
  font-size: 14px;
  font-weight: ${weight.medium};
  color: ${sage.textMuted};
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
  &:hover {
    background: rgba(79, 132, 72, 0.06);
    color: ${sage.textSecondary};
  }
  &:focus-visible {
    outline: 2px solid ${sage.greenPrimary};
    outline-offset: 2px;
  }
`;

const navItemActiveStyle = css`
  background: ${sage.greenLight};
  color: ${sage.greenPrimary};
  font-weight: ${weight.semibold};
  &:hover {
    background: ${sage.greenLight};
    color: ${sage.greenPrimary};
  }
`;

const navIconStyle = css`
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
`;

const navLabelStyle = css`
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 200ms ${easing.out}, transform 200ms ${easing.out};
`;

// The parent hover state triggers label visibility via CSS adjacency
const sidebarHoverLabel = css`
  ${sidebarStyle} :hover & {
    opacity: 1;
    transform: translateX(0);
  }
`;

const footerStyle = css`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  width: 100%;
  border-top: 1px solid rgba(79, 132, 72, 0.08);
  margin-top: auto;
`;

const avatarStyle = css`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${sage.greenLight};
  border: 1.5px solid rgba(79, 132, 72, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${font.satoshi};
  font-size: 12px;
  font-weight: ${weight.semibold};
  color: ${sage.greenPrimary};
  flex-shrink: 0;
`;

const userNameStyle = css`
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.medium};
  color: ${sage.textSecondary};
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 200ms ${easing.out}, transform 200ms ${easing.out};
`;

export const Sidebar: FC<SidebarProps> = ({
  activeItem,
  userName = "Usuario",
  userInitials = "U",
}) => (
  <nav class={sidebarStyle} aria-label="Menu principal">
    <div class={navStyle}>
      {NAV_ITEMS.map((item) => (
        <a
          href={item.id === "familias" ? "/social-care" : `/${item.id}`}
          class={`${navItemStyle} ${
            item.id === activeItem ? navItemActiveStyle : ""
          }`}
          aria-current={item.id === activeItem ? "page" : undefined}
        >
          <span class={navIconStyle} aria-hidden="true">{item.icon}</span>
          <span class={`${navLabelStyle} ${sidebarHoverLabel}`}>
            {item.label}
          </span>
        </a>
      ))}
    </div>
    <div class={footerStyle}>
      <span class={avatarStyle} aria-hidden="true">{userInitials}</span>
      <span class={`${userNameStyle} ${sidebarHoverLabel}`}>{userName}</span>
    </div>
  </nav>
);
