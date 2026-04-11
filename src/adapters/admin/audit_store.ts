// AuditStore — In-memory append-only audit log with FIFO eviction.
// Follows the same factory pattern as createSessionStore.

import type {
  AuditAppendInput,
  AuditEntry,
  AuditListOptions,
  AuditListResult,
  AuditStore,
} from "./types.ts";

const MAX_ENTRIES = 10_000;

/**
 * Creates an in-memory audit store.
 * Max 10_000 entries. FIFO eviction when full (oldest removed first).
 * Auto-generates `id` (crypto.randomUUID) and `timestamp` (ISO string) on append.
 */
export const createAuditStore = (): AuditStore => {
  // Internal mutable array — adapter-layer only, FIFO eviction needs in-place mutation
  const entries: AuditEntry[] = [];

  const append = (input: AuditAppendInput): AuditEntry => {
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      actorId: input.actorId,
      actorName: input.actorName,
      action: input.action,
      targetId: input.targetId,
      details: input.details,
      outcome: input.outcome,
      errorMessage: input.errorMessage,
    };

    entries.push(entry);

    // FIFO eviction: remove oldest when exceeding max
    if (entries.length > MAX_ENTRIES) {
      entries.splice(0, entries.length - MAX_ENTRIES);
    }

    return entry;
  };

  const paginate = (
    source: readonly AuditEntry[],
    options: AuditListOptions,
  ): AuditListResult => {
    // Reverse for DESC order (newest first — insertion order is chronological)
    const reversed = [...source].reverse();
    const sliced = reversed.slice(
      options.offset,
      options.offset + options.limit,
    );
    return { entries: sliced, total: source.length };
  };

  const list = (options: AuditListOptions): AuditListResult =>
    paginate(entries, options);

  const listByActor = (
    actorId: string,
    options: AuditListOptions,
  ): AuditListResult => {
    const filtered = entries.filter((e) => e.actorId === actorId);
    return paginate(filtered, options);
  };

  const count = (): number => entries.length;

  return { append, list, listByActor, count };
};
