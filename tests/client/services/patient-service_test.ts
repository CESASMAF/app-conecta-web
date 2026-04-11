import { assertEquals } from "@std/assert";
import { patientService } from "../../../src/client/services/patient-service.ts";

const mockFetch = (response: Response): () => void => {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => response) as unknown as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
};

Deno.test("patientService.search - builds URL with params", async () => {
  let capturedUrl = "";
  const original = globalThis.fetch;
  globalThis.fetch = (async (url: string | URL | Request) => {
    capturedUrl = typeof url === "string" ? url : url.toString();
    return new Response(
      JSON.stringify({
        data: [],
        meta: { timestamp: "", pageSize: 20, totalCount: 0, hasMore: false, nextCursor: null },
      }),
      { status: 200 },
    );
  }) as unknown as typeof fetch;
  try {
    await patientService.search("maria", 10, "cursor-abc");
    assertEquals(capturedUrl.includes("search=maria"), true);
    assertEquals(capturedUrl.includes("limit=10"), true);
    assertEquals(capturedUrl.includes("cursor=cursor-abc"), true);
  } finally {
    globalThis.fetch = original;
  }
});

Deno.test("patientService.search - returns paginated result", async () => {
  const restore = mockFetch(
    new Response(
      JSON.stringify({
        data: [{ patientId: "p1", personId: "x", fullName: "Ana", firstName: null, lastName: null, primaryDiagnosis: null, memberCount: 2 }],
        meta: { timestamp: "2024-01-01T00:00:00Z", pageSize: 20, totalCount: 1, hasMore: false, nextCursor: null },
      }),
      { status: 200 },
    ),
  );
  try {
    const result = await patientService.search();
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.data.length, 1);
      assertEquals(result.value.meta.totalCount, 1);
    }
  } finally {
    restore();
  }
});

Deno.test("patientService.getById - returns patient detail", async () => {
  const restore = mockFetch(
    new Response(
      JSON.stringify({ data: { patientId: "p1", personId: "x", personalData: null, civilDocuments: null, address: null, diagnoses: [], familyMembers: [], socialIdentity: null, socioeconomicSituation: null, healthStatus: null, communitySupportNetwork: null, educationalStatus: null, violationReports: [], workAndIncome: null, intakeInfo: null, housingCondition: null } }),
      { status: 200 },
    ),
  );
  try {
    const result = await patientService.getById("p1");
    assertEquals(result.ok, true);
    if (result.ok) assertEquals(result.value.patientId, "p1");
  } finally {
    restore();
  }
});

Deno.test("patientService.create - posts and returns id", async () => {
  const restore = mockFetch(
    new Response(JSON.stringify({ data: { id: "new-patient" } }), { status: 201 }),
  );
  try {
    const result = await patientService.create({ firstName: "Test" });
    assertEquals(result.ok, true);
    if (result.ok) assertEquals(result.value.id, "new-patient");
  } finally {
    restore();
  }
});
