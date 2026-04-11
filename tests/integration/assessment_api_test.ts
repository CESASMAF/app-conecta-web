// =============================================================================
// Integration Test: Assessment API E2E
// =============================================================================
// Tests Assessment bounded context endpoints through the full middleware chain.
// All 8 assessment update endpoints are tested for proxy behavior.
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
const ACTOR_ID = "actor-uuid-assessment";

const SUCCESS_RESPONSE: RemoteResponse = {
  status: 200,
  headers: new Headers(),
  body: { success: true },
};

// ---------------------------------------------------------------------------
// PUT /api/v1/patients/:id/housing-condition
// ---------------------------------------------------------------------------

describe("Assessment API E2E - PUT /api/v1/patients/:id/housing-condition", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
    ctx.remoteClient.setResponse(ok(SUCCESS_RESPONSE));
  });

  it("proxies valid housing condition update to backend", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/housing-condition`,
      sessionId,
      {
        method: "PUT",
        body: {
          housingType: "HOUSE",
          wallMaterial: "BRICK",
          waterSupply: "PUBLIC",
          sewageType: "PUBLIC",
          rooms: 3,
          hasElectricity: true,
        },
        actorId: ACTOR_ID,
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(captured.path, `/api/v1/patients/${PATIENT_ID}/housing-condition`);
    assertEquals(captured.method, "PUT");
    assertEquals(captured.actorId, ACTOR_ID);
  });

  it("forwards complete housing condition payload to backend", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const payload = {
      housingType: "APARTMENT",
      wallMaterial: "WOOD",
      waterSupply: "WELL",
      sewageType: "NONE",
      rooms: 5,
      hasElectricity: false,
      observations: "Near flood zone",
    };
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/housing-condition`,
      sessionId,
      {
        method: "PUT",
        body: payload,
        actorId: ACTOR_ID,
      },
    );
    await ctx.app.request(req);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    const body = captured.body as Record<string, unknown>;
    assertEquals(body.housingType, "APARTMENT");
    assertEquals(body.rooms, 5);
    assertEquals(body.observations, "Near flood zone");
  });
});

// ---------------------------------------------------------------------------
// PUT /api/v1/patients/:id/health-status
// ---------------------------------------------------------------------------

describe("Assessment API E2E - PUT /api/v1/patients/:id/health-status", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
    ctx.remoteClient.setResponse(ok(SUCCESS_RESPONSE));
  });

  it("proxies valid health status update to backend", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/health-status`,
      sessionId,
      {
        method: "PUT",
        body: {
          hasDisability: true,
          disabilityType: "PHYSICAL",
          hasContinuousMedication: true,
          medications: ["Medication A"],
          isPregnant: false,
        },
        actorId: ACTOR_ID,
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(captured.path, `/api/v1/patients/${PATIENT_ID}/health-status`);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/v1/patients/:id/educational-status
// ---------------------------------------------------------------------------

describe("Assessment API E2E - PUT /api/v1/patients/:id/educational-status", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
    ctx.remoteClient.setResponse(ok(SUCCESS_RESPONSE));
  });

  it("proxies valid educational status update to backend", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/educational-status`,
      sessionId,
      {
        method: "PUT",
        body: {
          educationLevel: "COMPLETE_HIGH_SCHOOL",
          isCurrentlyStudying: false,
          schoolName: undefined,
        },
        actorId: ACTOR_ID,
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(captured.path, `/api/v1/patients/${PATIENT_ID}/educational-status`);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/v1/patients/:id/socio-economic-situation
// ---------------------------------------------------------------------------

describe("Assessment API E2E - PUT /api/v1/patients/:id/socio-economic-situation", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
    ctx.remoteClient.setResponse(ok(SUCCESS_RESPONSE));
  });

  it("proxies valid socio-economic situation update to backend", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/socio-economic-situation`,
      sessionId,
      {
        method: "PUT",
        body: {
          familyIncome: 2500.0,
          perCapitaIncome: 833.33,
          incomeSource: "EMPLOYMENT",
          housingCost: 800.0,
          familyMemberCount: 3,
        },
        actorId: ACTOR_ID,
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(
      captured.path,
      `/api/v1/patients/${PATIENT_ID}/socio-economic-situation`,
    );
    const body = captured.body as Record<string, unknown>;
    assertEquals(body.familyIncome, 2500.0);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/v1/patients/:id/work-and-income
// ---------------------------------------------------------------------------

describe("Assessment API E2E - PUT /api/v1/patients/:id/work-and-income", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
    ctx.remoteClient.setResponse(ok(SUCCESS_RESPONSE));
  });

  it("proxies valid work and income update to backend", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/work-and-income`,
      sessionId,
      {
        method: "PUT",
        body: {
          isEmployed: true,
          occupation: "Teacher",
          monthlyIncome: 3500.0,
          hasInformalWork: false,
        },
        actorId: ACTOR_ID,
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(captured.path, `/api/v1/patients/${PATIENT_ID}/work-and-income`);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/v1/patients/:id/social-benefits
// ---------------------------------------------------------------------------

describe("Assessment API E2E - PUT /api/v1/patients/:id/social-benefits", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
    ctx.remoteClient.setResponse(ok(SUCCESS_RESPONSE));
  });

  it("proxies valid social benefits update to backend", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/social-benefits`,
      sessionId,
      {
        method: "PUT",
        body: {
          benefits: [
            {
              typeId: "benefit-type-uuid",
              startDate: "2023-01-01T00:00:00.000Z",
              amount: 600.0,
              isActive: true,
            },
          ],
        },
        actorId: ACTOR_ID,
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/v1/patients/:id/community-support-network
// ---------------------------------------------------------------------------

describe("Assessment API E2E - PUT /api/v1/patients/:id/community-support-network", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
    ctx.remoteClient.setResponse(ok(SUCCESS_RESPONSE));
  });

  it("proxies valid community support network update to backend", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/community-support-network`,
      sessionId,
      {
        method: "PUT",
        body: {
          hasReligiousSupport: true,
          hasCommunityAssociation: false,
          supportDescription: "Local church support group",
        },
        actorId: ACTOR_ID,
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(
      captured.path,
      `/api/v1/patients/${PATIENT_ID}/community-support-network`,
    );
  });
});

// ---------------------------------------------------------------------------
// PUT /api/v1/patients/:id/social-health-summary
// ---------------------------------------------------------------------------

describe("Assessment API E2E - PUT /api/v1/patients/:id/social-health-summary", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
    ctx.remoteClient.setResponse(ok(SUCCESS_RESPONSE));
  });

  it("proxies valid social health summary update to backend", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${PATIENT_ID}/social-health-summary`,
      sessionId,
      {
        method: "PUT",
        body: {
          overallAssessment: "MODERATE_VULNERABILITY",
          riskLevel: "MEDIUM",
          notes: "Family shows moderate social vulnerability indicators.",
        },
        actorId: ACTOR_ID,
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(
      captured.path,
      `/api/v1/patients/${PATIENT_ID}/social-health-summary`,
    );
  });
});

// ---------------------------------------------------------------------------
// Cross-cutting: All assessment endpoints require authentication
// ---------------------------------------------------------------------------

describe("Assessment API E2E - Authentication Required", () => {
  const endpoints = [
    "/housing-condition",
    "/health-status",
    "/educational-status",
    "/socio-economic-situation",
    "/work-and-income",
    "/social-benefits",
    "/community-support-network",
    "/social-health-summary",
  ];

  for (const endpoint of endpoints) {
    it(`returns 401 for PUT /api/v1/patients/:id${endpoint} without session`, async () => {
      const ctx = createTestApp();
      const req = new Request(
        `http://localhost/api/v1/patients/${PATIENT_ID}${endpoint}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Site": "same-origin",
          },
          body: JSON.stringify({ test: true }),
        },
      );
      const res = await ctx.app.request(req);
      assertEquals(res.status, 401);
    });
  }
});
