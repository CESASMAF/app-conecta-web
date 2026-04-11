// =============================================================================
// Integration Test: Protection API E2E
// =============================================================================
// Tests Protection bounded context endpoints through the full middleware chain.
// Covers CreateReferral, ReportRightsViolation, and UpdatePlacementHistory.
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
const ACTOR_ID = "actor-uuid-protection";

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
// POST /api/v1/patients/:id/referrals (CreateReferral)
// ---------------------------------------------------------------------------

describe("Protection API E2E - POST /api/v1/patients/:id/referrals", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
    ctx.remoteClient.setResponse(ok(SUCCESS_201));
  });

  it("proxies valid referral creation to backend", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/referrals`,
      sessionId,
      {
        method: "POST",
        body: {
          reason: "Family requires specialized legal assistance for guardianship.",
          destinationService: "CREAS",
          referralDate: "2024-05-10T00:00:00.000Z",
          professionalId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          status: "PENDING",
        },
        actorId: ACTOR_ID,
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 201);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(captured.path, `/api/v1/patients/${PATIENT_ID}/referrals`);
    assertEquals(captured.method, "POST");
    assertEquals(captured.actorId, ACTOR_ID);
    assertEquals(captured.accessToken, "test-access-token-abc123");
  });

  it("forwards referral with all fields to backend", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const payload = {
      reason: "Suspected neglect requiring immediate intervention.",
      destinationService: "MINISTERIO_PUBLICO",
      referralDate: "2024-07-22T09:00:00.000Z",
      professionalId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      status: "PENDING",
      notes: "High priority case.",
      contactPerson: "Dr. Ana Santos",
      contactPhone: "11999887766",
    };
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/referrals`,
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
    assertEquals(body.reason, payload.reason);
    assertEquals(body.destinationService, "MINISTERIO_PUBLICO");
    assertEquals(body.notes, "High priority case.");
  });

  it("returns 401 without session", async () => {
    const req = new Request(
      `http://localhost/api/v1/patients/${PATIENT_ID}/referrals`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Sec-Fetch-Site": "same-origin",
        },
        body: JSON.stringify({ reason: "test" }),
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 401);
  });
});

// ---------------------------------------------------------------------------
// GET /api/v1/patients/:id/referrals (List referrals)
// ---------------------------------------------------------------------------

describe("Protection API E2E - GET /api/v1/patients/:id/referrals", () => {
  it("proxies GET referrals to backend", async () => {
    const ctx = createTestApp();
    const referrals = [
      { id: "ref-1", status: "PENDING" },
      { id: "ref-2", status: "COMPLETED" },
    ];
    ctx.remoteClient.setResponse(
      ok({ status: 200, headers: new Headers(), body: { data: referrals } }),
    );

    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/referrals`,
      sessionId,
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);

    const body = await res.json();
    assertEquals(body.data.length, 2);
  });
});

// ---------------------------------------------------------------------------
// POST /api/v1/patients/:id/violation-reports (ReportRightsViolation)
// ---------------------------------------------------------------------------

describe("Protection API E2E - POST /api/v1/patients/:id/violation-reports", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
    ctx.remoteClient.setResponse(ok(SUCCESS_201));
  });

  it("proxies valid rights violation report to backend", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/violation-reports`,
      sessionId,
      {
        method: "POST",
        body: {
          violationType: "NEGLIGENCE",
          description: "Patient has been denied access to prescribed medication.",
          reportDate: "2024-08-05T00:00:00.000Z",
          incidentDate: "2024-08-01T00:00:00.000Z",
          reporterProfessionalId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        },
        actorId: ACTOR_ID,
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 201);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(captured.path, `/api/v1/patients/${PATIENT_ID}/violation-reports`);
    assertEquals(captured.method, "POST");
  });

  it("forwards violation report with witness information to backend", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const payload = {
      violationType: "PHYSICAL_ABUSE",
      description: "Observed signs of physical abuse during home visit.",
      reportDate: "2024-09-12T00:00:00.000Z",
      incidentDate: "2024-09-10T00:00:00.000Z",
      reporterProfessionalId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      witnesses: ["Neighbor Maria", "Community health agent"],
      evidenceDescription: "Photos attached to case file.",
    };
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/violation-reports`,
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
    assertEquals(body.violationType, "PHYSICAL_ABUSE");
    assertEquals(body.evidenceDescription, "Photos attached to case file.");
  });

  it("returns 401 without session", async () => {
    const req = new Request(
      `http://localhost/api/v1/patients/${PATIENT_ID}/violation-reports`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Sec-Fetch-Site": "same-origin",
        },
        body: JSON.stringify({ description: "test" }),
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 401);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/v1/patients/:id/placement-history (UpdatePlacementHistory)
// ---------------------------------------------------------------------------

describe("Protection API E2E - PUT /api/v1/patients/:id/placement-history", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
    ctx.remoteClient.setResponse(ok(SUCCESS_200));
  });

  it("proxies valid placement history update to backend", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/placement-history`,
      sessionId,
      {
        method: "PUT",
        body: {
          entries: [
            {
              institutionName: "Abrigo Sao Paulo",
              startDate: "2023-01-15T00:00:00.000Z",
              endDate: "2023-06-30T00:00:00.000Z",
              reason: "Court-ordered temporary shelter.",
            },
            {
              institutionName: "Foster Family Santos",
              startDate: "2023-07-01T00:00:00.000Z",
              reason: "Placed with foster family pending adoption review.",
            },
          ],
        },
        actorId: ACTOR_ID,
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(captured.path, `/api/v1/patients/${PATIENT_ID}/placement-history`);
    assertEquals(captured.method, "PUT");
    assertEquals(captured.actorId, ACTOR_ID);

    const body = captured.body as Record<string, unknown>;
    const entries = body.entries as readonly Record<string, unknown>[];
    assertEquals(entries.length, 2);
    assertEquals(entries[0]?.institutionName, "Abrigo Sao Paulo");
  });

  it("proxies placement history with single entry", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/placement-history`,
      sessionId,
      {
        method: "PUT",
        body: {
          entries: [
            {
              institutionName: "CRAS Central",
              startDate: "2024-01-01T00:00:00.000Z",
              reason: "Initial social protection placement.",
            },
          ],
        },
        actorId: ACTOR_ID,
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);
  });

  it("returns 401 without session", async () => {
    const req = new Request(
      `http://localhost/api/v1/patients/${PATIENT_ID}/placement-history`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Sec-Fetch-Site": "same-origin",
        },
        body: JSON.stringify({ entries: [] }),
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 401);
  });
});

// ---------------------------------------------------------------------------
// Cross-cutting: Security headers present on all protection responses
// ---------------------------------------------------------------------------

describe("Protection API E2E - Security Headers on All Responses", () => {
  it("includes security headers on successful protection API responses", async () => {
    const ctx = createTestApp();
    ctx.remoteClient.setResponse(ok(SUCCESS_201));

    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/referrals`,
      sessionId,
      {
        method: "POST",
        body: { reason: "test" },
        actorId: ACTOR_ID,
      },
    );
    const res = await ctx.app.request(req);

    assertExists(res.headers.get("Strict-Transport-Security"));
    assertExists(res.headers.get("X-Content-Type-Options"));
    assertExists(res.headers.get("X-Frame-Options"));
    assertExists(res.headers.get("Content-Security-Policy"));
  });
});

// ---------------------------------------------------------------------------
// People Context Proxy
// ---------------------------------------------------------------------------

describe("Protection API E2E - People Context Proxy", () => {
  it("proxies /api/people/* to peopleContextBaseUrl", async () => {
    const ctx = createTestApp();
    ctx.remoteClient.setResponse(
      ok({
        status: 200,
        headers: new Headers(),
        body: { data: [{ id: "person-1" }] },
      }),
    );

    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      "/api/people/persons",
      sessionId,
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(captured.baseUrl, "http://people:3001");
    assertEquals(captured.path, "/api/v1/persons");
  });

  it("strips /api/people prefix and maps to /api/v1", async () => {
    const ctx = createTestApp();
    ctx.remoteClient.setResponse(
      ok({ status: 200, headers: new Headers(), body: { id: "p1" } }),
    );

    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      "/api/people/persons/some-uuid/details",
      sessionId,
    );
    await ctx.app.request(req);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(captured.path, "/api/v1/persons/some-uuid/details");
  });
});
