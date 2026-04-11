import { assertEquals } from "@std/assert";
import { IngressInfo } from "../../../src/domain/care/value-objects/ingress_info.ts";
import { LookupId } from "../../../src/domain/kernel/ids.ts";

// =============================================================================
// Helpers
// =============================================================================

const validLookupId = (): ReturnType<typeof LookupId> =>
  LookupId("f47ac10b-58cc-4372-a567-0e02b2c3d479");

const validProgramId = (): ReturnType<typeof LookupId> =>
  LookupId("a1b2c3d4-e5f6-7890-abcd-ef1234567890");

// =============================================================================
// IngressInfo Smart Constructor — Happy Path
// =============================================================================

Deno.test("IngressInfo - valid with linked programs returns Ok", () => {
  const typeId = validLookupId();
  const progId = validProgramId();
  assertEquals(typeId.ok, true);
  assertEquals(progId.ok, true);
  if (!typeId.ok || !progId.ok) return;

  const result = IngressInfo({
    ingressTypeId: typeId.value,
    originName: "CRAS Centro",
    originContact: "(11) 99999-0000",
    serviceReason: "Vulnerability assessment needed",
    linkedSocialPrograms: [
      { programId: progId.value, observation: "Active participant" },
    ],
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.ingressTypeId, typeId.value);
    assertEquals(result.value.originName, "CRAS Centro");
    assertEquals(result.value.originContact, "(11) 99999-0000");
    assertEquals(result.value.serviceReason, "Vulnerability assessment needed");
    assertEquals(result.value.linkedSocialPrograms.length, 1);
    assertEquals(result.value.linkedSocialPrograms[0]?.observation, "Active participant");
  }
});

Deno.test("IngressInfo - valid with empty optional fields", () => {
  const typeId = validLookupId();
  assertEquals(typeId.ok, true);
  if (!typeId.ok) return;

  const result = IngressInfo({
    ingressTypeId: typeId.value,
    originName: undefined,
    originContact: undefined,
    serviceReason: "Initial screening",
    linkedSocialPrograms: [],
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.originName, undefined);
    assertEquals(result.value.originContact, undefined);
    assertEquals(result.value.linkedSocialPrograms.length, 0);
  }
});

Deno.test("IngressInfo - empty originName becomes undefined", () => {
  const typeId = validLookupId();
  assertEquals(typeId.ok, true);
  if (!typeId.ok) return;

  const result = IngressInfo({
    ingressTypeId: typeId.value,
    originName: "",
    originContact: "  ",
    serviceReason: "Reason here",
    linkedSocialPrograms: [],
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.originName, undefined);
    assertEquals(result.value.originContact, undefined);
  }
});

Deno.test("IngressInfo - trims serviceReason", () => {
  const typeId = validLookupId();
  assertEquals(typeId.ok, true);
  if (!typeId.ok) return;

  const result = IngressInfo({
    ingressTypeId: typeId.value,
    originName: undefined,
    originContact: undefined,
    serviceReason: "  Trimmed reason  ",
    linkedSocialPrograms: [],
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.serviceReason, "Trimmed reason");
  }
});

// =============================================================================
// IngressInfo Smart Constructor — Error Path
// =============================================================================

Deno.test("IngressInfo - empty serviceReason returns ING-001", () => {
  const typeId = validLookupId();
  assertEquals(typeId.ok, true);
  if (!typeId.ok) return;

  const result = IngressInfo({
    ingressTypeId: typeId.value,
    originName: "Some origin",
    originContact: "Contact",
    serviceReason: "",
    linkedSocialPrograms: [],
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "ING-001");
  }
});

Deno.test("IngressInfo - whitespace-only serviceReason returns ING-001", () => {
  const typeId = validLookupId();
  assertEquals(typeId.ok, true);
  if (!typeId.ok) return;

  const result = IngressInfo({
    ingressTypeId: typeId.value,
    originName: undefined,
    originContact: undefined,
    serviceReason: "   ",
    linkedSocialPrograms: [],
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "ING-001");
  }
});
