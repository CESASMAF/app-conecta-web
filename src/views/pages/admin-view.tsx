// Admin Hub page — requires auth + admin role.
// The admin-hub client app hydrates into #admin-hub-app.
// User info is passed as a data attribute for the client to read.

import type { FC } from "@hono/hono/jsx";

interface AdminViewProps {
  readonly user: Readonly<{ name: string; role: string; initials: string }>;
}

export const AdminView: FC<AdminViewProps> = ({ user }) => (
  <div
    id="admin-hub-app"
    data-user={JSON.stringify(user)}
    style="min-height:100vh;background:#F2E2C4;"
  >
    <div style="display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:'Playfair Display',serif;font-style:italic;color:rgba(38,29,17,0.5);">
      Carregando administracao...
    </div>
  </div>
);
