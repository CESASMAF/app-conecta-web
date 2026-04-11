// =============================================================================
// Mock Backend — Simulates Swift/Vapor upstream for integration testing
// =============================================================================
// A Hono app that pretends to be the social-care backend. Validates Bearer
// tokens, returns StandardResponse<T> format, and captures requests for
// assertions.
// =============================================================================

import { Hono } from "@hono/hono";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CapturedBackendRequest = Readonly<{
  path: string;
  method: string;
  authorizationHeader: string | undefined;
  body: unknown;
  timestamp: number;
}>;

type ConfigurableResponse = Readonly<{
  status: number;
  body: unknown;
}>;

type MockBackend = Readonly<{
  app: Hono;
  port: number;
  /** All requests captured by the mock backend. */
  captured: () => readonly CapturedBackendRequest[];
  /** The last captured request (convenience). */
  lastCaptured: () => CapturedBackendRequest | undefined;
  /** Reset captured requests. */
  resetCaptured: () => void;
  /** Configure a specific response for a path+method. */
  setResponse: (path: string, method: string, response: ConfigurableResponse) => void;
  /** Cleanup function — call in afterAll. */
  cleanup: () => void;
}>;

// ---------------------------------------------------------------------------
// StandardResponse helper
// ---------------------------------------------------------------------------

const standardResponse = (data: unknown): Record<string, unknown> => ({
  data,
  meta: { timestamp: new Date().toISOString() },
});

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

const BACKEND_PORT = 9082;

export const createMockBackend = (): MockBackend => {
  const capturedRequests: CapturedBackendRequest[] = [];
  const configuredResponses = new Map<string, ConfigurableResponse>();

  const app = new Hono();

  // Capture all requests
  app.use("*", async (c, next) => {
    const method = c.req.method;
    const path = c.req.path;
    const authorizationHeader = c.req.header("authorization");

    let body: unknown = undefined;
    if (method !== "GET" && method !== "HEAD") {
      try {
        body = await c.req.json();
      } catch {
        // No body or not JSON — that is fine
      }
    }

    capturedRequests.push({
      path,
      method,
      authorizationHeader,
      body,
      timestamp: Date.now(),
    });

    await next();
  });

  // Auth validation middleware
  app.use("/api/*", async (c, next) => {
    const authHeader = c.req.header("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized", code: "AUTH-001" }, 401);
    }
    const token = authHeader.slice(7);
    if (token.length === 0) {
      return c.json({ error: "Unauthorized", code: "AUTH-001" }, 401);
    }
    await next();
  });

  // Check for configured responses
  app.use("*", async (c, next) => {
    const key = `${c.req.method}:${c.req.path}`;
    const configured = configuredResponses.get(key);
    if (configured) {
      if (configured.status === 204) {
        return c.body(null, 204);
      }
      return c.json(configured.body, configured.status as 200);
    }
    await next();
  });

  // ---- Patient endpoints ----
  app.get("/api/v1/patients", (c) =>
    c.json(
      standardResponse([
        { id: "pat-001", name: "Maria Silva", cpf: "52998224725" },
        { id: "pat-002", name: "Joao Santos", cpf: "11144477735" },
      ]),
    ),
  );

  app.post("/api/v1/patients", (c) =>
    c.json(
      standardResponse({ id: "pat-new-001", status: "created" }),
      201,
    ),
  );

  app.get("/api/v1/patients/:id", (c) => {
    const id = c.req.param("id");
    return c.json(
      standardResponse({
        id,
        name: "Maria Silva",
        cpf: "52998224725",
        personalData: { birthDate: "1990-01-15" },
      }),
    );
  });

  // ---- Family member endpoints ----
  app.post("/api/v1/patients/:id/family-members", (c) =>
    c.json(
      standardResponse({ memberId: "fm-001", status: "added" }),
      201,
    ),
  );

  app.delete("/api/v1/patients/:id/family-members/:memberId", (c) =>
    c.body(null, 204),
  );

  // ---- Caregiver + Social Identity ----
  app.put("/api/v1/patients/:id/primary-caregiver", (c) =>
    c.json(standardResponse({ status: "updated" })),
  );

  app.put("/api/v1/patients/:id/social-identity", (c) =>
    c.json(standardResponse({ status: "updated" })),
  );

  // ---- Assessment endpoints ----
  app.put("/api/v1/patients/:id/housing-condition", (c) =>
    c.json(standardResponse({ status: "updated" })),
  );

  app.put("/api/v1/patients/:id/health-status", (c) =>
    c.json(standardResponse({ status: "updated" })),
  );

  app.put("/api/v1/patients/:id/educational-status", (c) =>
    c.json(standardResponse({ status: "updated" })),
  );

  app.put("/api/v1/patients/:id/socio-economic-situation", (c) =>
    c.json(standardResponse({ status: "updated" })),
  );

  app.put("/api/v1/patients/:id/work-and-income", (c) =>
    c.json(standardResponse({ status: "updated" })),
  );

  app.put("/api/v1/patients/:id/social-benefits", (c) =>
    c.json(standardResponse({ status: "updated" })),
  );

  app.put("/api/v1/patients/:id/community-support-network", (c) =>
    c.json(standardResponse({ status: "updated" })),
  );

  app.put("/api/v1/patients/:id/social-health-summary", (c) =>
    c.json(standardResponse({ status: "updated" })),
  );

  // ---- Care endpoints ----
  app.post("/api/v1/patients/:id/appointments", (c) =>
    c.json(
      standardResponse({ appointmentId: "apt-001", status: "registered" }),
      201,
    ),
  );

  // ---- Protection endpoints ----
  app.post("/api/v1/patients/:id/referrals", (c) =>
    c.json(
      standardResponse({ referralId: "ref-001", status: "created" }),
      201,
    ),
  );

  app.post("/api/v1/patients/:id/violation-reports", (c) =>
    c.json(
      standardResponse({ reportId: "vr-001", status: "reported" }),
      201,
    ),
  );

  app.put("/api/v1/patients/:id/placement-history", (c) =>
    c.json(standardResponse({ status: "updated" })),
  );

  // Start server
  const controller = new AbortController();
  Deno.serve(
    { port: BACKEND_PORT, signal: controller.signal, onListen: () => {} },
    app.fetch,
  );

  return {
    app,
    port: BACKEND_PORT,
    captured: () => capturedRequests,
    lastCaptured: () => capturedRequests[capturedRequests.length - 1],
    resetCaptured: () => {
      capturedRequests.length = 0;
    },
    setResponse: (path, method, response) => {
      configuredResponses.set(`${method}:${path}`, response);
    },
    cleanup: () => controller.abort(),
  };
};
