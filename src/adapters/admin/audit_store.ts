// AuditStore — In-memory append-only audit log with FIFO eviction.
// Immutable: entries stored in insertion order, pagination reads backwards.

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
  // Immutable reference — replaced on each append via spread copy
  let entries: readonly AuditEntry[] = [];

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
      errorMessage: input.outcome === "FAILURE" ? input.errorMessage : undefined,
    };

    const next = [...entries, entry];

    // FIFO eviction: keep only the most recent MAX_ENTRIES
    entries = next.length > MAX_ENTRIES
      ? next.slice(next.length - MAX_ENTRIES)
      : next;

    return entry;
  };

  /**
   * Paginate source in DESC order (newest first) without copying/reversing.
   * Reads backwards from end using index math: O(limit) not O(N).
   */
  const paginate = (
    source: readonly AuditEntry[],
    options: AuditListOptions,
  ): AuditListResult => {
    const total = source.length;
    const start = total - 1 - options.offset;
    const result: AuditEntry[] = [];

    for (
      let i = start;
      i >= 0 && result.length < options.limit;
      i--
    ) {
      result.push(source[i]!);
    }

    return { entries: result, total };
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
