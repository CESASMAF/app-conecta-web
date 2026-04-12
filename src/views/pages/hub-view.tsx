// Hub page — requires auth, shows app selector loading placeholder.
// The auth-hub client app hydrates into #auth-hub-app.

import type { FC } from "@hono/hono/jsx";

export const HubView: FC = () => (
  <div id="auth-hub-app" style="min-height:100vh;background:#F2E2C4;">
    <div
      style="display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:'Playfair Display',serif;font-style:italic;color:rgba(38,29,17,0.5);"
    >
      Carregando módulos...
    </div>
  </div>
);
