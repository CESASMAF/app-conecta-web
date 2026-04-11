// =============================================================================
// Integration Test: Care API E2E
// =============================================================================
// Tests Care bounded context endpoints through the full middleware chain.
// Covers RegisterAppointment and RegisterIntakeInfo.
// =============================================================================

import {
  assertEquals,
  assertExists,
} from "@std/assert";
import { describe, it, beforeEach } from "@std/testing/bdd";
import { ok } from "../../src/domain/shared/result.ts";
import type { RemoteResponse } from "../../src/adapters/remote/remote_client.ts";
import {
  createTestApp,
  setupAuthenticatedSession,
  authenticatedApiRequest,
  type TestAppContext,
} from "./test_helpers.ts";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const PATIENT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const ACTOR_ID = "actor-uuid-care";

const SUCCESS_201: RemoteResponse = {
  status: 201,
  headers: new Headers(),
  body: { id: "new-resource-uuid" },
};

const SUCCESS_200: RemoteResponse = {
  status: 200,
  headers: new Headers(),
  body: { success: true },
};

// ---------------------------------------------------------------------------
// POST /api/v1/patients/:id/appointments (RegisterAppointment)
// ---------------------------------------------------------------------------

describe("Care API E2E - POST /api/v1/patients/:id/appointments", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
    ctx.remoteClient.setResponse(ok(SUCCESS_201));
  });

  it("proxies valid appointment registration to backend", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/appointments`,
      sessionId,
      {
        method: "POST",
        body: {
          appointmentType: "HOME_VISIT",
          date: "2024-03-15T14:00:00.000Z",
          summary: "Patient follow-up visit for medication review.",
          actionPlan: "Continue current treatment, schedule lab work.",
          professionalId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        },
        actorId: ACTOR_ID,
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 201);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(captured.path, `/api/v1/patients/${PATIENT_ID}/appointments`);
    assertEquals(captured.method, "POST");
    assertEquals(captured.actorId, ACTOR_ID);
  });

  it("forwards appointment with diagnosis to backend", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const payload = {
      appointmentType: "OFFICE_VISIT",
      date: "2024-06-20T10:30:00.000Z",
      summary: "Initial assessment for genetic condition.",
      actionPlan: "Refer to specialist.",
      professionalId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      diagnoses: [
        {
          icdCode: "Q90.0",
          description: "Trisomy 21",
          diagnosedAt: "2024-06-20T10:30:00.000Z",
        },
      ],
    };
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/appointments`,
      sessionId,
      {
        method: "POST",
        body: payload,
        actorId: ACTOR_ID,
      },
    );
    await ctx.app.request(req);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    const body = captured.body as Record<string, unknown>;
    assertEquals(body.appointmentType, "OFFICE_VISIT");
    assertEquals(
      (body.diagnoses as readonly unknown[]).length,
      1,
    );
  });

  it("returns 401 without session", async () => {
    const req = new Request(
      `http://localhost/api/v1/patients/${PATIENT_ID}/appointments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Sec-Fetch-Site": "same-origin",
        },
        body: JSON.stringify({
          appointmentType: "HOME_VISIT",
          date: "2024-03-15T14:00:00.000Z",
          summary: "test",
          actionPlan: "test",
        }),
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 401);
  });

  it("returns 403 when X-Requested-With is missing on POST", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);

    const req = new Request(
      `http://localhost/api/v1/patients/${PATIENT_ID}/appointments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Sec-Fetch-Site": "same-origin",
          Cookie: `__Host-session=${sessionId}`,
          // Missing X-Requested-With
        },
        body: JSON.stringify({ appointmentType: "HOME_VISIT" }),
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 403);
  });
});

// ---------------------------------------------------------------------------
// GET /api/v1/patients/:id/appointments (List appointments)
// ---------------------------------------------------------------------------

describe("Care API E2E - GET /api/v1/patients/:id/appointments", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
  });

  it("proxies GET appointments to backend", async () => {
    const appointments = [
      { id: "apt-1", appointmentType: "HOME_VISIT" },
      { id: "apt-2", appointmentType: "OFFICE_VISIT" },
    ];
    ctx.remoteClient.setResponse(
      ok({ status: 200, headers: new Headers(), body: { data: appointments } }),
    );

    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/appointments`,
      sessionId,
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);

    const body = await res.json();
    assertEquals(body.data.length, 2);
  });
});

// ---------------------------------------------------------------------------
// POST /api/v1/patients/:id/intake-info (RegisterIntakeInfo)
// ---------------------------------------------------------------------------

describe("Care API E2E - POST /api/v1/patients/:id/intake-info", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
    ctx.remoteClient.setResponse(ok(SUCCESS_201));
  });

  it("proxies valid intake info registration to backend", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/intake-info`,
      sessionId,
      {
        method: "POST",
        body: {
          serviceReason: "Family referred by health unit due to genetic condition diagnosis.",
          referralSource: "HEALTH_UNIT",
          ingressDate: "2024-01-10T00:00:00.000Z",
          professionalId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        },
        actorId: ACTOR_ID,
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 201);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(captured.path, `/api/v1/patients/${PATIENT_ID}/intake-info`);
    assertEquals(captured.method, "POST");
    assertEquals(captured.actorId, ACTOR_ID);

    const body = captured.body as Record<string, unknown>;
    assertEquals(body.referralSource, "HEALTH_UNIT");
  });

  it("returns 401 without session", async () => {
    const req = new Request(
      `http://localhost/api/v1/patients/${PATIENT_ID}/intake-info`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Sec-Fetch-Site": "same-origin",
        },
        body: JSON.stringify({ serviceReason: "test" }),
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 401);
  });
});
