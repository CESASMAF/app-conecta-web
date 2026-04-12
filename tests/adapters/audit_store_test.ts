/**
 * Audit Store — Tests for createAuditStore() factory.
 * In-memory append-only audit store with FIFO eviction at 10_000 entries.
 */

import { assert, assertEquals, assertExists } from "@std/assert";
import { createAuditStore } from "../../src/adapters/admin/audit_store.ts";
import type { AuditAppendInput } from "../../src/adapters/admin/types.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const sampleInput: AuditAppendInput = {
  actorId: "user-001",
  actorName: "Alice Admin",
  action: "PERSON_CREATED",
  targetId: "person-abc",
  details: "Created person via admin panel",
  outcome: "SUCCESS",
};

const failureInput: AuditAppendInput = {
  actorId: "user-002",
  actorName: "Bob Owner",
  action: "ROLE_ASSIGNED",
  targetId: "person-xyz",
  outcome: "FAILURE",
  errorMessage: "Role already assigned",
};

// =============================================================================
// append() — auto-generates id and timestamp
// =============================================================================

Deno.test("audit store - append() returns entry with auto-generated id", () => {
  const store = createAuditStore();
  const entry = store.append(sampleInput);

  assertExists(entry.id, "Entry must have an auto-generated id");
  assert(entry.id.length > 0, "id must not be empty");
});

Deno.test("audit store - append() returns entry with auto-generated timestamp", () => {
  const store = createAuditStore();
  const entry = store.append(sampleInput);

  assertExists(entry.timestamp, "Entry must have an auto-generated timestamp");
  // Timestamp should be a valid ISO string
  const parsed = new Date(entry.timestamp).getTime();
  assert(!isNaN(parsed), "timestamp must be a valid ISO date string");
});

Deno.test("audit store - append() preserves all input fields", () => {
  const store = createAuditStore();
  const entry = store.append(sampleInput);

  assertEquals(entry.actorId, "user-001");
  assertEquals(entry.actorName, "Alice Admin");
  assertEquals(entry.action, "PERSON_CREATED");
  assertEquals(entry.targetId, "person-abc");
  assertEquals(entry.details, "Created person via admin panel");
  assertEquals(entry.outcome, "SUCCESS");
  assertEquals(entry.errorMessage, undefined);
});

Deno.test("audit store - append() with failure input preserves errorMessage", () => {
  const store = createAuditStore();
  const entry = store.append(failureInput);

  assertEquals(entry.outcome, "FAILURE");
  assertEquals(entry.errorMessage, "Role already assigned");
});

Deno.test("audit store - append() generates unique ids for each entry", () => {
  const store = createAuditStore();
  const entry1 = store.append(sampleInput);
  const entry2 = store.append(sampleInput);

  assert(entry1.id !== entry2.id, "Each entry must have a unique id");
});

// =============================================================================
// list() — sorted by timestamp DESC with pagination
// =============================================================================

Deno.test("audit store - list() returns entries sorted by timestamp DESC", () => {
  const store = createAuditStore();

  store.append({ ...sampleInput, actorName: "First" });
  store.append({ ...sampleInput, actorName: "Second" });
  store.append({ ...sampleInput, actorName: "Third" });

  const result = store.list({ limit: 10, offset: 0 });

  assertEquals(result.entries.length, 3);
  assertEquals(result.total, 3);
  // Most recent first
  assertEquals(result.entries[0]!.actorName, "Third");
  assertEquals(result.entries[2]!.actorName, "First");
});

Deno.test("audit store - list() with limit returns limited entries", () => {
  const store = createAuditStore();

  for (let i = 0; i < 5; i++) {
    store.append({ ...sampleInput, actorName: `User ${i}` });
  }

  const result = store.list({ limit: 2, offset: 0 });

  assertEquals(result.entries.length, 2);
  assertEquals(result.total, 5);
});

Deno.test("audit store - list() with offset skips entries", () => {
  const store = createAuditStore();

  for (let i = 0; i < 5; i++) {
    store.append({ ...sampleInput, actorName: `User ${i}` });
  }

  const result = store.list({ limit: 2, offset: 2 });

  assertEquals(result.entries.length, 2);
  assertEquals(result.total, 5);
  // After sorting DESC: User 4, User 3, User 2, User 1, User 0
  // Offset 2 skips User 4 and User 3
  assertEquals(result.entries[0]!.actorName, "User 2");
  assertEquals(result.entries[1]!.actorName, "User 1");
});

Deno.test("audit store - list() on empty store returns empty entries", () => {
  const store = createAuditStore();
  const result = store.list({ limit: 10, offset: 0 });

  assertEquals(result.entries.length, 0);
  assertEquals(result.total, 0);
});

// =============================================================================
// listByActor() — filtered by actorId
// =============================================================================

Deno.test("audit store - listByActor() filters entries by actorId", () => {
  const store = createAuditStore();

  store.append({ ...sampleInput, actorId: "user-A" });
  store.append({ ...sampleInput, actorId: "user-B" });
  store.append({ ...sampleInput, actorId: "user-A" });
  store.append({ ...sampleInput, actorId: "user-C" });

  const result = store.listByActor("user-A", { limit: 10, offset: 0 });

  assertEquals(result.entries.length, 2);
  assertEquals(result.total, 2);
  for (const entry of result.entries) {
    assertEquals(entry.actorId, "user-A");
  }
});

Deno.test("audit store - listByActor() returns empty for unknown actor", () => {
  const store = createAuditStore();
  store.append(sampleInput);

  const result = store.listByActor("nonexistent", { limit: 10, offset: 0 });

  assertEquals(result.entries.length, 0);
  assertEquals(result.total, 0);
});

Deno.test("audit store - listByActor() supports pagination", () => {
  const store = createAuditStore();

  for (let i = 0; i < 5; i++) {
    store.append({
      ...sampleInput,
      actorId: "user-A",
      actorName: `Entry ${i}`,
    });
  }
  store.append({ ...sampleInput, actorId: "user-B" });

  const result = store.listByActor("user-A", { limit: 2, offset: 1 });

  assertEquals(result.entries.length, 2);
  assertEquals(result.total, 5);
});

// =============================================================================
// count() — total entries
// =============================================================================

Deno.test("audit store - count() returns 0 for empty store", () => {
  const store = createAuditStore();
  assertEquals(store.count(), 0);
});

Deno.test("audit store - count() returns total number of entries", () => {
  const store = createAuditStore();

  store.append(sampleInput);
  store.append(sampleInput);
  store.append(sampleInput);

  assertEquals(store.count(), 3);
});

// =============================================================================
// FIFO eviction at 10_000 entries
// =============================================================================

Deno.test("audit store - FIFO eviction removes oldest when exceeding 10_000", () => {
  const store = createAuditStore();

  // Fill store to capacity
  for (let i = 0; i < 10_000; i++) {
    store.append({ ...sampleInput, targetId: `target-${i}` });
  }

  assertEquals(store.count(), 10_000);

  // Add one more — should evict oldest
  const newest = store.append({ ...sampleInput, targetId: "target-overflow" });

  assertEquals(store.count(), 10_000);

  // The newest entry should be present
  const result = store.list({ limit: 1, offset: 0 });
  assertEquals(result.entries[0]!.id, newest.id);

  // The oldest (target-0) should have been evicted
  const allEntries = store.list({ limit: 10_000, offset: 0 });
  const hasOldest = allEntries.entries.some((e) => e.targetId === "target-0");
  assertEquals(
    hasOldest,
    false,
    "Oldest entry should have been evicted by FIFO",
  );
});

// =============================================================================
// All audit actions are accepted
// =============================================================================

Deno.test("audit store - accepts all AuditAction variants", () => {
  const store = createAuditStore();

  const actions = [
    "PERSON_CREATED",
    "PERSON_UPDATED",
    "PERSON_DEACTIVATED",
    "PERSON_REACTIVATED",
    "ROLE_ASSIGNED",
    "ROLE_DEACTIVATED",
    "ROLE_REACTIVATED",
    "LOOKUP_CREATED",
    "LOOKUP_UPDATED",
    "LOOKUP_TOGGLED",
    "LOOKUP_APPROVED",
    "LOOKUP_REJECTED",
    "LOOKUP_REQUEST_CREATED",
    "LOOKUP_REQUEST_APPROVED",
    "LOOKUP_REQUEST_REJECTED",
  ] as const;

  for (const action of actions) {
    const entry = store.append({ ...sampleInput, action });
    assertEquals(entry.action, action);
  }

  assertEquals(store.count(), 15);
});
