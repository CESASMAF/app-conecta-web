import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
import { alpha, color, font, weight } from "../../../styles/tokens.ts";

interface AdminHeaderProps {
  readonly user: Readonly<{ name: string; role: string; initials: string }>;
}

const headerStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${color.backgroundDark};
  padding: 16px 20px;
  @media (min-width: 600px) {
    padding: 20px 48px;
  }
`;

const brandStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const logoStyle = css`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${color.background};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${font.satoshi};
  font-weight: ${weight.bold};
  font-size: 16px;
  color: ${color.backgroundDark};
`;

const brandTitleStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.bold};
  font-size: 18px;
  color: ${color.textOnDark};
`;

const brandSubStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.regular};
  font-size: 18px;
  color: ${alpha("#F2E2C4", 0.6)};
  margin-left: 6px;
`;

const userAreaStyle = css`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const userTextStyle = css`
  display: none;
  text-align: right;
  @media (min-width: 600px) {
    display: block;
  }
`;

const userNameStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.medium};
  font-size: 14px;
  color: ${color.textOnDark};
`;

const userRoleStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.regular};
  font-size: 12px;
  color: ${alpha("#F2E2C4", 0.5)};
`;

const avatarStyle = css`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${alpha("#F2E2C4", 0.15)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${font.satoshi};
  font-weight: ${weight.semibold};
  font-size: 14px;
  color: ${color.textOnDark};
`;

export const AdminHeader: FC<AdminHeaderProps> = ({ user }) => (
  <header class={headerStyle}>
    <div class={brandStyle}>
      <div class={logoStyle} aria-hidden="true">A</div>
      <span>
        <span class={brandTitleStyle}>ACDG</span>
        <span class={brandSubStyle}>Administracao</span>
      </span>
    </div>
    <div class={userAreaStyle}>
      <div class={userTextStyle}>
        <div class={userNameStyle}>{user.name}</div>
        <div class={userRoleStyle}>{user.role}</div>
      </div>
      <div class={avatarStyle} aria-hidden="true">{user.initials}</div>
    </div>
  </header>
);
