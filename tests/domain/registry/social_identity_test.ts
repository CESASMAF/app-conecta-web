import { assertEquals } from "@std/assert";
import { LookupId } from "../../../src/domain/kernel/ids.ts";
import { SocialIdentity } from "../../../src/domain/registry/value-objects/social_identity.ts";

// ---------------------------------------------------------------------------
// Helper: create a valid LookupId for test inputs
// ---------------------------------------------------------------------------

const validLookupId = (): ReturnType<typeof LookupId> =>
  LookupId("f47ac10b-58cc-4372-a567-0e02b2c3d479");

const getTypeId = () => {
  const r = validLookupId();
  if (!r.ok) throw new Error("test setup: invalid LookupId");
  return r.value;
};

// =============================================================================
// Happy Path — Normal type (isOtherType = false)
// =============================================================================

Deno.test("SocialIdentity - normal type with no description returns Ok with undefined otherDescription", () => {
  const result = SocialIdentity({
    typeId: getTypeId(),
    isOtherType: false,
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.otherDescription, undefined);
  }
});

Deno.test("SocialIdentity - normal type with description returns Ok with description preserved", () => {
  const result = SocialIdentity({
    typeId: getTypeId(),
    otherDescription: "Quilombola",
    isOtherType: false,
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.otherDescription, "Quilombola");
  }
});

// =============================================================================
// Happy Path — Other type (isOtherType = true)
// =============================================================================

Deno.test("SocialIdentity - other type with description returns Ok", () => {
  const result = SocialIdentity({
    typeId: getTypeId(),
    otherDescription: "Comunidade ribeirinha",
    isOtherType: true,
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.typeId, getTypeId());
    assertEquals(result.value.otherDescription, "Comunidade ribeirinha");
  }
});

// =============================================================================
// Error Path — SI-001: Other type requires description
// =============================================================================

Deno.test("SocialIdentity - other type without description returns SI-001", () => {
  const result = SocialIdentity({
    typeId: getTypeId(),
    isOtherType: true,
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "SI-001");
  }
});

Deno.test("SocialIdentity - other type with empty description returns SI-001", () => {
  const result = SocialIdentity({
    typeId: getTypeId(),
    otherDescription: "",
    isOtherType: true,
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "SI-001");
  }
});

// =============================================================================
// Normalization — null_if_empty (whitespace-only → undefined)
// =============================================================================

Deno.test("SocialIdentity - description with only spaces normalizes to undefined", () => {
  const result = SocialIdentity({
    typeId: getTypeId(),
    otherDescription: "   ",
    isOtherType: false,
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.otherDescription, undefined);
  }
});

Deno.test("SocialIdentity - other type with only spaces description returns SI-001", () => {
  const result = SocialIdentity({
    typeId: getTypeId(),
    otherDescription: "   ",
    isOtherType: true,
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "SI-001");
  }
});

// =============================================================================
// Normalization — trim preserves content
// =============================================================================

Deno.test("SocialIdentity - description with leading/trailing spaces is trimmed", () => {
  const result = SocialIdentity({
    typeId: getTypeId(),
    otherDescription: "  Cigano  ",
    isOtherType: false,
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.otherDescription, "Cigano");
  }
});
