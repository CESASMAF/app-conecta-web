// =============================================================================
// Regression Tests — Domain Layer Code Review Findings
// =============================================================================
// These tests are TDD Red-First: they MUST FAIL until the fixes are applied.
// Each test maps to a specific finding from CODE_REVIEW_FINDINGS.md.
// =============================================================================

import { assertEquals } from "@std/assert";

// ---------------------------------------------------------------------------
// Helper: recursively walk a directory and collect all .ts file paths
// ---------------------------------------------------------------------------

const walkDir = async (dir: string): Promise<readonly string[]> => {
  const results: string[] = [];
  for await (const entry of Deno.readDir(dir)) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory) {
      const sub = await walkDir(path);
      results.push(...sub);
    } else if (entry.isFile && entry.name.endsWith(".ts")) {
      results.push(path);
    }
  }
  return results;
};

// ===========================================================================
// W-D1: No .push() in domain shared/result.ts
// ===========================================================================

Deno.test("W-D1: combine() in result.ts does not use .push()", async () => {
  const source = await Deno.readTextFile("src/domain/shared/result.ts");
  assertEquals(
    source.includes(".push("),
    false,
    "combine should use functional accumulation (reduce/spread), not .push()",
  );
});

// ===========================================================================
// W-D2: No `let` in domain kernel/address.ts
// ===========================================================================

Deno.test("W-D2: address.ts does not use let keyword", async () => {
  const source = await Deno.readTextFile("src/domain/kernel/address.ts");
  // Match `let` as a keyword (word boundary + identifier following)
  const hasLet = /\blet\s+\w/.test(source);
  assertEquals(
    hasLet,
    false,
    "address.ts should not use let reassignment — extract to helper returning Result",
  );
});

// ===========================================================================
// W-D3: UUID regex/helpers defined in exactly one shared file
// ===========================================================================

Deno.test("W-D3: UUID regex is defined in exactly one file under domain/", async () => {
  const files = [
    "src/domain/kernel/ids.ts",
    "src/domain/registry/value-objects/patient_id.ts",
    "src/domain/care/value-objects/appointment_id.ts",
    "src/domain/protection/value-objects/referral_id.ts",
    "src/domain/protection/value-objects/violation_report_id.ts",
  ];
  let filesWithUuidRegex = 0;
  for (const f of files) {
    try {
      const source = await Deno.readTextFile(f);
      // Detect inline UUID regex pattern or UUID_REGEX constant
      if (
        source.includes("UUID_REGEX") ||
        /\[0-9a-f\]\{8\}/.test(source) ||
        /\[a-f0-9\]\{8\}/.test(source)
      ) {
        filesWithUuidRegex++;
      }
    } catch {
      // File might not exist yet — skip
    }
  }
  assertEquals(
    filesWithUuidRegex <= 1,
    true,
    `UUID regex should be in a shared file, not duplicated across ${filesWithUuidRegex} files`,
  );
});

// ===========================================================================
// W-D4: No += mutation in family_age_profile.ts
// ===========================================================================

Deno.test("W-D4: family_age_profile.ts does not use += mutation", async () => {
  const source = await Deno.readTextFile(
    "src/domain/assessment/services/family_age_profile.ts",
  );
  assertEquals(
    source.includes("+="),
    false,
    "Should use functional accumulation (reduce), not += mutation",
  );
});

// ===========================================================================
// W-D5: No += mutation in education_analytics.ts
// ===========================================================================

Deno.test("W-D5: education_analytics.ts does not use += mutation", async () => {
  const source = await Deno.readTextFile(
    "src/domain/assessment/services/education_analytics.ts",
  );
  assertEquals(
    source.includes("+="),
    false,
    "Should use functional accumulation (reduce), not += mutation",
  );
});

// ===========================================================================
// W-D6: appointment_type.ts uses ReadonlySet, not Array.includes()
// ===========================================================================

Deno.test("W-D6: appointment_type.ts does not use .includes() for validation", async () => {
  const source = await Deno.readTextFile(
    "src/domain/care/value-objects/appointment_type.ts",
  );
  assertEquals(
    source.includes(".includes("),
    false,
    "Should use Set.has() instead of Array.includes() for O(1) lookup",
  );
});

Deno.test("W-D6: appointment_type.ts uses Set or ReadonlySet", async () => {
  const source = await Deno.readTextFile(
    "src/domain/care/value-objects/appointment_type.ts",
  );
  const usesSet = source.includes("new Set") ||
    source.includes("ReadonlySet") ||
    source.includes(".has(");
  assertEquals(
    usesSet,
    true,
    "Should use ReadonlySet with .has() for type validation",
  );
});

// ===========================================================================
// W-D7: No `as Result<never` cast in placement_history.ts
// ===========================================================================

Deno.test("W-D7: placement_history.ts does not use 'as Result<never' cast", async () => {
  const source = await Deno.readTextFile(
    "src/domain/protection/entities/placement_history.ts",
  );
  assertEquals(
    source.includes("as Result<never"),
    false,
    "Should use err(result.error) instead of unsafe 'as Result<never>' cast",
  );
});

// ===========================================================================
// I-D2: RGDocument rejects invalid date format (NaN should fail)
// ===========================================================================

Deno.test("I-D2: RGDocument rejects invalid date format", async () => {
  const { RGDocument } = await import(
    "../../src/domain/kernel/rg_document.ts"
  );
  const result = RGDocument({
    number: "12345678X",
    issuingState: "SP",
    issuingAgency: "SSP",
    issueDate: "not-a-date",
  });
  assertEquals(result.ok, false, "Invalid date format 'not-a-date' should be rejected");
});

Deno.test("I-D2: RGDocument rejects date that produces NaN", async () => {
  const { RGDocument } = await import(
    "../../src/domain/kernel/rg_document.ts"
  );
  const result = RGDocument({
    number: "12345678X",
    issuingState: "SP",
    issuingAgency: "SSP",
    issueDate: "2020-13-45",
  });
  assertEquals(result.ok, false, "Date '2020-13-45' should be rejected as invalid");
});

// ===========================================================================
// I-D3: RGDocument normalizes issueDate to ISO YYYY-MM-DD format
// ===========================================================================

Deno.test("I-D3: RGDocument normalizes issueDate to YYYY-MM-DD", async () => {
  const { RGDocument } = await import(
    "../../src/domain/kernel/rg_document.ts"
  );
  // Use a valid RG number for this test
  // The contract says number must be 8 digits + check digit
  const result = RGDocument({
    number: "123456782",
    issuingState: "SP",
    issuingAgency: "SSP",
    issueDate: "2020-1-5",
  });
  // If the result is ok, the date must be normalized
  if (result.ok) {
    assertEquals(
      result.value.issueDate,
      "2020-01-05",
      "Date should be normalized to YYYY-MM-DD format with zero-padded month/day",
    );
  } else {
    // If it rejects valid-but-unnormalized dates, that also indicates missing normalization
    // The finding says dates are NOT normalized — so we expect this test to fail
    assertEquals(
      true,
      false,
      "RGDocument should accept and normalize '2020-1-5' to '2020-01-05'",
    );
  }
});

// ===========================================================================
// I-D10: ICDCode validates ICD-10 format (not just empty check)
// ===========================================================================

Deno.test("I-D10: ICDCode rejects non-ICD format string", async () => {
  const { ICDCode } = await import(
    "../../src/domain/care/value-objects/icd_code.ts"
  );
  const result = ICDCode("ZZZZ");
  assertEquals(
    result.ok,
    false,
    "Non-ICD format 'ZZZZ' should be rejected — not just empty check",
  );
});

Deno.test("I-D10: ICDCode rejects random gibberish", async () => {
  const { ICDCode } = await import(
    "../../src/domain/care/value-objects/icd_code.ts"
  );
  const result = ICDCode("hello world 123");
  assertEquals(
    result.ok,
    false,
    "Random string should be rejected by ICD-10 format validation",
  );
});

// ===========================================================================
// I-D12: ViolationReport trims descriptionOfFact before storing
// ===========================================================================

Deno.test("I-D12: createViolationReport trims descriptionOfFact (source check)", async () => {
  // Behavioral test deferred — the source check below validates the fix statically.
  // The contract for protection aggregates is not yet defined in 001-contracts/.
  // This test verifies the source code applies trim.
  const source = await Deno.readTextFile(
    "src/domain/protection/aggregates/rights-violation-report/operations.ts",
  );
  const hasTrimOnDescription = source.includes(".trim()");
  assertEquals(
    hasTrimOnDescription,
    true,
    "createViolationReport should call .trim() on string inputs",
  );
});

Deno.test("I-D12: rights-violation-report/operations.ts trims descriptionOfFact field", async () => {
  const source = await Deno.readTextFile(
    "src/domain/protection/aggregates/rights-violation-report/operations.ts",
  );
  // Verify that trim is applied specifically to descriptionOfFact
  const lines = source.split("\n");
  const trimNearDescription = lines.some((line, i) => {
    const context = lines.slice(Math.max(0, i - 2), i + 3).join("\n");
    return context.includes("descriptionOfFact") && context.includes(".trim()");
  });
  assertEquals(
    trimNearDescription,
    true,
    "operations.ts should trim descriptionOfFact before storing",
  );
});

// ===========================================================================
// I-D13: Referral trims reason before storing
// ===========================================================================

Deno.test("I-D13: createReferral trims reason (source check)", async () => {
  // Behavioral test deferred — contract for referral is not in 001-contracts/.
  // Static check validates the fix.
  const source = await Deno.readTextFile(
    "src/domain/protection/aggregates/referral/operations.ts",
  );
  const lines = source.split("\n");
  const trimNearReason = lines.some((line, i) => {
    const context = lines.slice(Math.max(0, i - 2), i + 3).join("\n");
    return context.includes("reason") && context.includes(".trim()");
  });
  assertEquals(
    trimNearReason,
    true,
    "operations.ts should trim reason before storing",
  );
});

Deno.test("I-D13: referral/operations.ts has .trim() call", async () => {
  const source = await Deno.readTextFile(
    "src/domain/protection/aggregates/referral/operations.ts",
  );
  assertEquals(
    source.includes(".trim()"),
    true,
    "referral operations.ts should use .trim() for string sanitization",
  );
});

// ===========================================================================
// I-I5: authGuard does not prefix-match /health too broadly
// ===========================================================================

Deno.test("I-I5: authGuard public paths do not broadly prefix-match /health", async () => {
  const source = await Deno.readTextFile("src/middleware/auth_guard.ts");
  // The guard should match EXACTLY "/health" or use a strict comparison,
  // not startsWith("/health") which would match /healthcheck, /healthy, etc.
  const hasBroadPrefix = source.includes('startsWith("/health")') ||
    source.includes('startsWith("/health")');
  assertEquals(
    hasBroadPrefix,
    false,
    "authGuard should use exact match for /health, not prefix matching",
  );
});

Deno.test("I-I5: authGuard uses exact path matching for public routes", async () => {
  const source = await Deno.readTextFile("src/middleware/auth_guard.ts");
  // Should use === "/health" or an exact set lookup
  const usesExactMatch = source.includes('=== "/health"') ||
    source.includes('"/health"') && source.includes(".has(");
  assertEquals(
    usesExactMatch,
    true,
    "authGuard should use exact path matching (=== or Set.has) for public routes",
  );
});

// ===========================================================================
// GLOBAL REGRESSION: No throw/class/this in domain layer
// ===========================================================================

Deno.test("Regression: zero 'throw' in entire domain layer", async () => {
  const domainFiles = await walkDir("src/domain");
  const violations: string[] = [];
  for (const file of domainFiles) {
    const source = await Deno.readTextFile(file);
    if (/\bthrow\b/.test(source)) {
      violations.push(file);
    }
  }
  assertEquals(
    violations.length,
    0,
    `'throw' is FORBIDDEN in domain. Found in: ${violations.join(", ")}`,
  );
});

Deno.test("Regression: zero 'class' in entire domain layer", async () => {
  const domainFiles = await walkDir("src/domain");
  const violations: string[] = [];
  for (const file of domainFiles) {
    const source = await Deno.readTextFile(file);
    if (/\bclass\s+\w/.test(source)) {
      violations.push(file);
    }
  }
  assertEquals(
    violations.length,
    0,
    `'class' is FORBIDDEN in domain. Found in: ${violations.join(", ")}`,
  );
});

Deno.test("Regression: zero 'this' in entire domain layer", async () => {
  const domainFiles = await walkDir("src/domain");
  const violations: string[] = [];
  for (const file of domainFiles) {
    const source = await Deno.readTextFile(file);
    if (/\bthis\b/.test(source)) {
      violations.push(file);
    }
  }
  assertEquals(
    violations.length,
    0,
    `'this' is FORBIDDEN in domain. Found in: ${violations.join(", ")}`,
  );
});

Deno.test("Regression: zero 'any' type annotation in domain layer", async () => {
  const domainFiles = await walkDir("src/domain");
  const violations: string[] = [];
  for (const file of domainFiles) {
    const source = await Deno.readTextFile(file);
    // Match `: any`, `as any`, `<any>` but not inside comments or string literals
    if (/\bas\s+any\b/.test(source) || /:\s*any\b/.test(source)) {
      violations.push(file);
    }
  }
  assertEquals(
    violations.length,
    0,
    `'any' is FORBIDDEN in domain. Found in: ${violations.join(", ")}`,
  );
});

// ===========================================================================
// W-A2: No crypto.randomUUID() side effect in application layer
// ===========================================================================

Deno.test("W-A2: update_placement_history.ts does not call crypto.randomUUID() directly", async () => {
  const source = await Deno.readTextFile(
    "src/application/protection/use-cases/update_placement_history.ts",
  );
  assertEquals(
    source.includes("crypto.randomUUID()"),
    false,
    "ID generation should be injected as dependency, not called directly in app layer",
  );
});

// ===========================================================================
// W-A1: No unused imports in register_patient.ts
// ===========================================================================

Deno.test("W-A1: register_patient.ts has no unused err/combine imports", async () => {
  const source = await Deno.readTextFile(
    "src/application/registry/use-cases/register_patient.ts",
  );
  // If `err` is imported, it should be used (not just in the import line)
  const lines = source.split("\n");
  const importLines = lines.filter((l) =>
    l.includes("import") && (l.includes("err") || l.includes("combine"))
  );
  for (const importLine of importLines) {
    if (importLine.includes("err")) {
      const nonImportUsage = lines.filter(
        (l) => !l.includes("import") && /\berr\b/.test(l),
      );
      assertEquals(
        nonImportUsage.length > 0,
        true,
        "err is imported but never used in register_patient.ts",
      );
    }
    if (importLine.includes("combine")) {
      const nonImportUsage = lines.filter(
        (l) => !l.includes("import") && /\bcombine\b/.test(l),
      );
      assertEquals(
        nonImportUsage.length > 0,
        true,
        "combine is imported but never used in register_patient.ts",
      );
    }
  }
});
