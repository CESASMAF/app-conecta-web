// Landing page — public, shows brand + loading placeholder.
// The auth-hub client app hydrates into #auth-hub-app.

import type { FC } from "@hono/hono/jsx";

export const LandingView: FC = () => (
  <div
    id="auth-hub-app"
    style="min-height:100vh;background:#172D48;display:flex;justify-content:center;align-items:center;"
  >
    <div
      style="text-align:center;color:#F2E2C4;font-family:'Playfair Display',serif;font-style:italic;opacity:0.5;"
    >
      Carregando...
    </div>
  </div>
);
