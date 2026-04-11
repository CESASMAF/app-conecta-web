import { Hono } from "@hono/hono";
import type { AppEnv } from "../types.ts";
import { AppLayout } from "../views/layouts/app_layout.tsx";
import { SocialCareView } from "../views/pages/social-care-view.tsx";
import { RegistrationView } from "../views/pages/registration-view.tsx";
import { FamilyView } from "../views/pages/family-view.tsx";
import { LoginView } from "../views/pages/login-view.tsx";

export const pageRoutes = new Hono<AppEnv>();

// Redirect root to social-care
pageRoutes.get("/", (c) => c.redirect("/social-care"));

// Login page (SSR-only, no client JS, public route)
pageRoutes.get("/login", (c) => {
  const nonce = c.get("cspNonce");
  return c.html(
    <AppLayout title="Login" nonce={nonce}>
      <LoginView />
    </AppLayout>
  );
});

// Home — Social Care families list
pageRoutes.get("/social-care", (c) => {
  const nonce = c.get("cspNonce");
  return c.html(
    <AppLayout title="Familias" nonce={nonce} scripts={["/static/js/social-care.js"]}>
      <SocialCareView />
    </AppLayout>
  );
});

// Patient Registration — 7-step wizard
pageRoutes.get("/patient-registration", (c) => {
  const nonce = c.get("cspNonce");
  return c.html(
    <AppLayout title="Cadastro" nonce={nonce} scripts={["/static/js/registration.js"]}>
      <RegistrationView />
    </AppLayout>
  );
});

// Family Composition
pageRoutes.get("/family-composition/:patientId", (c) => {
  const patientId = c.req.param("patientId");
  const nonce = c.get("cspNonce");
  return c.html(
    <AppLayout title="Composicao Familiar" nonce={nonce} scripts={["/static/js/family-composition.js"]}>
      <FamilyView patientId={patientId} />
    </AppLayout>
  );
});
