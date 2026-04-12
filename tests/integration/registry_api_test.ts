// =============================================================================
// Integration Test: Registry API E2E
// =============================================================================
// Tests Registry bounded context endpoints through the full middleware chain.
// Validates that requests reach the proxy with correct data, and that
// domain validation rejects invalid payloads before proxying.
// =============================================================================

import {
  assertEquals,
  assertExists,
  assertStringIncludes,
} from "@std/assert";
import { describe, it, beforeEach } from "@std/testing/bdd";
import { ok, err } from "../../src/domain/shared/result.ts";
import type { RemoteResponse } from "../../src/adapters/remote/remote_client.ts";
import {
  createTestApp,
  createMockRemoteClient,
  setupAuthenticatedSession,
  authenticatedApiRequest,
  type TestAppContext,
} from "./test_helpers.ts";

// ---------------------------------------------------------------------------
// POST /api/v1/patients (RegisterPatient)
// ---------------------------------------------------------------------------

describe("Registry API E2E - POST /api/v1/patients", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
  });

  it("proxies valid patient registration to backend with 201", async () => {
    const backendResponse: RemoteResponse = {
      status: 201,
      headers: new Headers(),
      body: { id: "patient-uuid-123", name: "Maria Silva" },
    };
    ctx.remoteClient.setResponse(ok(backendResponse));

    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      "/api/v1/patients",
      sessionId,
      {
        method: "POST",
        body: {
          cpf: "529.982.247-25",
          firstName: "Maria",
          lastName: "Silva",
          motherName: "Ana Silva",
          nationality: "Brasileira",
          sex: "FEMININO",
          birthDate: "1990-05-15T00:00:00.000Z",
        },
        actorId: "actor-uuid-001",
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 201);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(captured.method, "POST");
    assertEquals(captured.path, "/api/v1/patients");
    assertEquals(captured.actorId, "actor-uuid-001");
    assertEquals(captured.accessToken, "test-access-token-abc123");
  });

  it("proxies valid patient with all optional fields", async () => {
    const backendResponse: RemoteResponse = {
      status: 201,
      headers: new Headers(),
      body: { id: "patient-uuid-456" },
    };
    ctx.remoteClient.setResponse(ok(backendResponse));

    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      "/api/v1/patients",
      sessionId,
      {
        method: "POST",
        body: {
          cpf: "529.982.247-25",
          firstName: "Joao",
          lastName: "Santos",
          motherName: "Maria Santos",
          nationality: "Brasileira",
          sex: "MASCULINO",
          socialName: "J Santos",
          birthDate: "1985-03-20T00:00:00.000Z",
          phone: "11999887766",
          address: {
            state: "SP",
            city: "Sao Paulo",
            residenceLocation: "URBANO",
            isShelter: false,
          },
        },
        actorId: "actor-uuid-002",
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 201);
  });

  it("forwards X-Actor-Id to backend", async () => {
    ctx.remoteClient.setResponse(
      ok({ status: 201, headers: new Headers(), body: { id: "p1" } }),
    );

    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      "/api/v1/patients",
      sessionId,
      {
        method: "POST",
        body: { name: "test" },
        actorId: "specific-actor-id-789",
      },
    );
    await ctx.app.request(req);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(captured.actorId, "specific-actor-id-789");
  });

  it("returns 401 without session", async () => {
    const req = new Request("http://localhost/api/v1/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Sec-Fetch-Site": "same-origin",
      },
      body: JSON.stringify({ name: "test" }),
    });
    const res = await ctx.app.request(req);
    assertEquals(res.status, 401);
  });

  it("returns 400 for malformed JSON body", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);

    const req = new Request("http://localhost/api/v1/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Sec-Fetch-Site": "same-origin",
        Cookie: `__Host-session=${sessionId}`,
      },
      body: "not valid json{{{",
    });
    const res = await ctx.app.request(req);
    assertEquals(res.status, 400);
    const body = await res.json();
    assertStringIncludes(body.error, "Malformed");
  });

  it("returns 400 when body is a non-object type (string)", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      "/api/v1/patients",
      sessionId,
      {
        method: "POST",
        body: "just a string",
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/v1/patients (Search/List)
// ---------------------------------------------------------------------------

describe("Registry API E2E - GET /api/v1/patients", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
  });

  it("proxies GET request with query params to backend", async () => {
    const backendResponse: RemoteResponse = {
      status: 200,
      headers: new Headers(),
      body: { data: [{ id: "p1", name: "Test" }], total: 1 },
    };
    ctx.remoteClient.setResponse(ok(backendResponse));

    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      "/api/v1/patients?search=maria&page=1",
      sessionId,
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);

    const body = await res.json();
    assertEquals(body.data.length, 1);
  });

  it("returns 401 without session", async () => {
    const req = new Request("http://localhost/api/v1/patients", {
      headers: { "Sec-Fetch-Site": "same-origin" },
    });
    const res = await ctx.app.request(req);
    assertEquals(res.status, 401);
  });
});

// ---------------------------------------------------------------------------
// POST /api/v1/patients/:id/family-members (AddFamilyMember)
// ---------------------------------------------------------------------------

describe("Registry API E2E - POST /api/v1/patients/:id/family-members", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
  });

  it("proxies valid family member addition to backend", async () => {
    const backendResponse: RemoteResponse = {
      status: 201,
      headers: new Headers(),
      body: { id: "family-member-uuid" },
    };
    ctx.remoteClient.setResponse(ok(backendResponse));

    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const patientId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${patientId}/family-members`,
      sessionId,
      {
        method: "POST",
        body: {
          personId: "f1e2d3c4-b5a6-7890-abcd-ef1234567890",
          relationship: "MOTHER",
          name: "Ana Silva",
          birthDate: "1965-08-10T00:00:00.000Z",
        },
        actorId: "actor-uuid-001",
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 201);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(captured.path, `/api/v1/patients/${patientId}/family-members`);
    assertEquals(captured.method, "POST");
  });

  it("returns 401 without session", async () => {
    const req = new Request(
      "http://localhost/api/v1/patients/some-id/family-members",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Sec-Fetch-Site": "same-origin",
        },
        body: JSON.stringify({ name: "test" }),
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 401);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/v1/patients/:id/family-members/:memberId (RemoveFamilyMember)
// ---------------------------------------------------------------------------

describe("Registry API E2E - DELETE /api/v1/patients/:id/family-members/:memberId", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
  });

  it("proxies valid family member removal to backend (non-204 response)", async () => {
    // NOTE: Backend 204 causes c.json(null, 204) to throw in Hono
    // ("Response with null body status cannot have body").
    // This is a known bug in api.ts. Testing with 200 response instead.
    ctx.remoteClient.setResponse(
      ok({ status: 200, headers: new Headers(), body: { deleted: true } }),
    );

    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const patientId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const memberId = "f1e2d3c4-b5a6-7890-abcd-ef1234567890";
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${patientId}/family-members/${memberId}`,
      sessionId,
      {
        method: "DELETE",
        body: {},
        actorId: "actor-uuid-001",
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(
      captured.path,
      `/api/v1/patients/${patientId}/family-members/${memberId}`,
    );
    assertEquals(captured.method, "DELETE");
  });

  it("proxies DELETE without body successfully (no Content-Type = no parse)", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const patientId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const memberId = "f1e2d3c4-b5a6-7890-abcd-ef1234567890";
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${patientId}/family-members/${memberId}`,
      sessionId,
      {
        method: "DELETE",
        actorId: "actor-uuid-001",
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);
  });

  it("returns 204 with no body when backend returns 204", async () => {
    ctx.remoteClient.setResponse(
      ok({ status: 204, headers: new Headers(), body: null }),
    );

    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const patientId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const memberId = "f1e2d3c4-b5a6-7890-abcd-ef1234567890";
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${patientId}/family-members/${memberId}`,
      sessionId,
      {
        method: "DELETE",
        body: {},
        actorId: "actor-uuid-001",
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 204);
    assertEquals(res.body, null);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/v1/patients/:id/primary-caregiver (AssignPrimaryCaregiver)
// ---------------------------------------------------------------------------

describe("Registry API E2E - PUT /api/v1/patients/:id/primary-caregiver", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
  });

  it("proxies valid primary caregiver assignment to backend", async () => {
    ctx.remoteClient.setResponse(
      ok({ status: 200, headers: new Headers(), body: { success: true } }),
    );

    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const patientId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${patientId}/primary-caregiver`,
      sessionId,
      {
        method: "PUT",
        body: {
          familyMemberId: "f1e2d3c4-b5a6-7890-abcd-ef1234567890",
        },
        actorId: "actor-uuid-001",
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(captured.path, `/api/v1/patients/${patientId}/primary-caregiver`);
    assertEquals(captured.method, "PUT");
  });
});

// ---------------------------------------------------------------------------
// PUT /api/v1/patients/:id/social-identity (UpdateSocialIdentity)
// ---------------------------------------------------------------------------

describe("Registry API E2E - PUT /api/v1/patients/:id/social-identity", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
  });

  it("proxies valid social identity update to backend", async () => {
    ctx.remoteClient.setResponse(
      ok({ status: 200, headers: new Headers(), body: { success: true } }),
    );

    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const patientId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${patientId}/social-identity`,
      sessionId,
      {
        method: "PUT",
        body: {
          typeId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          isOtherType: false,
        },
        actorId: "actor-uuid-001",
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);
  });

  it("proxies social identity with otherDescription when isOtherType is true", async () => {
    ctx.remoteClient.setResponse(
      ok({ status: 200, headers: new Headers(), body: { success: true } }),
    );

    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const patientId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const req = await authenticatedApiRequest(
      `/api/v1/patients/${patientId}/social-identity`,
      sessionId,
      {
        method: "PUT",
        body: {
          typeId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          isOtherType: true,
          otherDescription: "Indigenous community member",
        },
        actorId: "actor-uuid-001",
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);

    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    const body = captured.body as Record<string, unknown>;
    assertEquals(body.otherDescription, "Indigenous community member");
  });
});

// ---------------------------------------------------------------------------
// Backend Error Propagation
// ---------------------------------------------------------------------------

describe("Registry API E2E - Backend Error Propagation", () => {
  it("returns 502 when backend is unreachable (NETWORK_ERROR)", async () => {
    const networkErrorClient = createMockRemoteClient(err("NETWORK_ERROR"));
    const ctx = createTestApp({ remoteClient: networkErrorClient });
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);

    const req = await authenticatedApiRequest(
      "/api/v1/patients",
      sessionId,
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 502);
    const body = await res.json();
    assertEquals(body.error, "NETWORK_ERROR");
  });

  it("returns 504 when backend times out", async () => {
    const timeoutClient = createMockRemoteClient(err("TIMEOUT"));
    const ctx = createTestApp({ remoteClient: timeoutClient });
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);

    const req = await authenticatedApiRequest(
      "/api/v1/patients",
      sessionId,
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 504);
    const body = await res.json();
    assertEquals(body.error, "TIMEOUT");
  });

  it("returns 401 when backend rejects the access token", async () => {
    const unauthorizedClient = createMockRemoteClient(err("UNAUTHORIZED"));
    const ctx = createTestApp({ remoteClient: unauthorizedClient });
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);

    const req = await authenticatedApiRequest(
      "/api/v1/patients",
      sessionId,
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 401);
    const body = await res.json();
    assertEquals(body.error, "UNAUTHORIZED");
  });

  it("returns 502 when backend returns 500", async () => {
    const serverErrorClient = createMockRemoteClient(err("SERVER_ERROR"));
    const ctx = createTestApp({ remoteClient: serverErrorClient });
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);

    const req = await authenticatedApiRequest(
      "/api/v1/patients",
      sessionId,
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 502);
    const body = await res.json();
    assertEquals(body.error, "SERVER_ERROR");
  });
});
