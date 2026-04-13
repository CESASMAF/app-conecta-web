// Landing page — public, shows brand + loading placeholder.
// The auth-hub client app hydrates into #auth-hub-app.

import type { FC } from "@hono/hono/jsx";

export const LandingView: FC = () => (
  <div
    id="auth-hub-app"
    style="min-height:100vh;background:linear-gradient(155deg,#F8F3EC 0%,#F0E8DC 25%,#E2E8DF 55%,#D4DDD0 100%);display:flex;justify-content:center;align-items:center;"
  >
    <div
      style="text-align:center;color:#6B7F65;font-family:'Satoshi',sans-serif;font-style:italic;opacity:0.5;"
    >
      Carregando...
    </div>
  </div>
);
