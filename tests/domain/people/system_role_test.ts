import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { AssignRoleInput } from "../../../src/domain/people/value-objects/system_role.ts";

describe("AssignRoleInput smart constructor", () => {
  it("creates valid input", () => {
    const result = AssignRoleInput({
      system: "social-care",
      role: "patient",
    });

    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.system, "social-care");
      assertEquals(result.value.role, "patient");
    }
  });

  it("trims whitespace from system and role", () => {
    const result = AssignRoleInput({
      system: "  social-care  ",
      role: "  patient  ",
    });

    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.system, "social-care");
      assertEquals(result.value.role, "patient");
    }
  });

  it("rejects empty system", () => {
    const result = AssignRoleInput({
      system: "",
      role: "patient",
    });

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "ROL-001");
    }
  });

  it("rejects whitespace-only system", () => {
    const result = AssignRoleInput({
      system: "   ",
      role: "patient",
    });

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "ROL-001");
    }
  });

  it("rejects empty role", () => {
    const result = AssignRoleInput({
      system: "social-care",
      role: "",
    });

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "ROL-001");
    }
  });

  it("rejects whitespace-only role", () => {
    const result = AssignRoleInput({
      system: "social-care",
      role: "   ",
    });

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "ROL-001");
    }
  });

  it("rejects both empty", () => {
    const result = AssignRoleInput({
      system: "",
      role: "",
    });

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "ROL-001");
    }
  });
});
