import { assertEquals } from "@std/assert";
import { CNS, formatCNS } from "../../../src/domain/kernel/cns.ts";
import { CPF } from "../../../src/domain/kernel/cpf.ts";

// ---------------------------------------------------------------------------
// Helper: create a valid CPF for CNS construction
// ---------------------------------------------------------------------------

const validCPF = (): ReturnType<typeof CPF> => CPF("52998224725");

// =============================================================================
// CNS Smart Constructor — Happy Path (Definitivo)
// =============================================================================

Deno.test("CNS - valid definitivo starting with 1 returns Ok", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  // 198765432100003 — verified definitivo checksum
  const result = CNS({ number: "198765432100003", cpf: cpfResult.value });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.number, "198765432100003");
    assertEquals(result.value.qrCode, undefined);
  }
});

Deno.test("CNS - valid definitivo starting with 2 returns Ok", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  // 242136428780000 — verified definitivo checksum
  const result = CNS({ number: "242136428780000", cpf: cpfResult.value });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.number, "242136428780000");
  }
});

// =============================================================================
// CNS Smart Constructor — Happy Path (Provisorio)
// =============================================================================

Deno.test("CNS - valid provisorio starting with 7 returns Ok", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  // 700000000001001 — verified provisorio checksum (sum % 11 == 0)
  const result = CNS({ number: "700000000001001", cpf: cpfResult.value });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.number, "700000000001001");
  }
});

Deno.test("CNS - valid provisorio starting with 8 returns Ok", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  // 800000000001008 — verified provisorio checksum
  const result = CNS({ number: "800000000001008", cpf: cpfResult.value });
  assertEquals(result.ok, true);
});

Deno.test("CNS - valid provisorio starting with 9 returns Ok", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  // 900000000001004 — verified provisorio checksum
  const result = CNS({ number: "900000000001004", cpf: cpfResult.value });
  assertEquals(result.ok, true);
});

// =============================================================================
// CNS Smart Constructor — CNS-001 (empty after trim)
// =============================================================================

Deno.test("CNS - empty number returns CNS-001", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  const result = CNS({ number: "", cpf: cpfResult.value });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CNS-001");
  }
});

Deno.test("CNS - whitespace-only number returns CNS-001", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  const result = CNS({ number: "   ", cpf: cpfResult.value });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CNS-001");
  }
});

// =============================================================================
// CNS Smart Constructor — CNS-002 (not exactly 15 digits)
// =============================================================================

Deno.test("CNS - too short (14 digits) returns CNS-002", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  const result = CNS({ number: "19876543210000", cpf: cpfResult.value });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CNS-002");
  }
});

Deno.test("CNS - too long (16 digits) returns CNS-002", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  const result = CNS({ number: "1987654321000031", cpf: cpfResult.value });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CNS-002");
  }
});

// =============================================================================
// CNS Smart Constructor — CNS-003 (invalid first digit)
// =============================================================================

Deno.test("CNS - first digit 3 returns CNS-003", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  const result = CNS({ number: "398765432100003", cpf: cpfResult.value });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CNS-003");
  }
});

Deno.test("CNS - first digit 0 returns CNS-003", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  const result = CNS({ number: "098765432100003", cpf: cpfResult.value });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CNS-003");
  }
});

Deno.test("CNS - first digit 5 returns CNS-003", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  const result = CNS({ number: "598765432100003", cpf: cpfResult.value });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CNS-003");
  }
});

// =============================================================================
// CNS Smart Constructor — CNS-005 (invalid checksum)
// =============================================================================

Deno.test("CNS - definitivo with bad checksum returns CNS-005", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  // 198765432100004 — last digit altered from valid 198765432100003
  const result = CNS({ number: "198765432100004", cpf: cpfResult.value });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CNS-005");
  }
});

Deno.test("CNS - provisorio with bad checksum returns CNS-005", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  // 700000000001002 — altered from valid 700000000001001
  const result = CNS({ number: "700000000001002", cpf: cpfResult.value });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CNS-005");
  }
});

// =============================================================================
// formatCNS — Formatting
// =============================================================================

Deno.test("formatCNS - formats as XXX XXXX XXXX XXXX", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  const result = CNS({ number: "198765432100003", cpf: cpfResult.value });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(formatCNS(result.value), "198 7654 3210 0003");
  }
});

// =============================================================================
// CNS with qrCode
// =============================================================================

Deno.test("CNS - with qrCode preserves value", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  const result = CNS({
    number: "198765432100003",
    cpf: cpfResult.value,
    qrCode: "  some-qr-data  ",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.qrCode, "some-qr-data");
  }
});

Deno.test("CNS - without qrCode has undefined", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  const result = CNS({ number: "198765432100003", cpf: cpfResult.value });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.qrCode, undefined);
  }
});

// =============================================================================
// CNS — Normalization (strips non-digits, trims)
// =============================================================================

Deno.test("CNS - number with spaces is normalized", () => {
  const cpfResult = validCPF();
  assertEquals(cpfResult.ok, true);
  if (!cpfResult.ok) return;

  const result = CNS({ number: " 198 7654 3210 0003 ", cpf: cpfResult.value });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.number, "198765432100003");
  }
});
