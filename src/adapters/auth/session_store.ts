import type { Session, SessionStore } from "../../types.ts";

/** Maximum number of sessions held in memory. */
const MAX_SESSIONS = 10_000;

/** Cookie name constant — session cookie is `__Host-session`. */
export const SESSION_COOKIE_NAME = "__Host-session";

/**
 * Sweeps expired sessions from the store.
 * Returns the number of entries removed.
 */
const sweepExpiredSessions = (
  sessions: Map<string, Session>,
  now: number,
): number => {
  let removed = 0;
  for (const [key, session] of sessions) {
    if (now >= session.expiresAt) {
      sessions.delete(key);
      removed++;
    }
  }
  return removed;
};

/**
 * Evicts the oldest sessions when the store exceeds its limit.
 */
const evictOldest = (
  sessions: Map<string, Session>,
  countToEvict: number,
): void => {
  const entries = [...sessions.entries()].sort(
    (a, b) => a[1].expiresAt - b[1].expiresAt,
  );
  for (let i = 0; i < countToEvict && i < entries.length; i++) {
    const entry = entries[i];
    if (entry !== undefined) {
      sessions.delete(entry[0]);
    }
  }
};

/**
 * Creates an in-memory session store with TTL check on get()
 * and memory bounds (MAX_SESSIONS limit with sweep on set).
 * Expired sessions are auto-deleted when accessed.
 */
export const createSessionStore = (): SessionStore => {
  const sessions = new Map<string, Session>();

  const get = (sessionId: string): Session | undefined => {
    const session = sessions.get(sessionId);
    if (session === undefined) return undefined;

    if (Date.now() >= session.expiresAt) {
      sessions.delete(sessionId);
      return undefined;
    }

    return session;
  };

  const set = (sessionId: string, session: Session): void => {
    // Enforce memory bounds before adding a new entry
    if (sessions.size >= MAX_SESSIONS) {
      const now = Date.now();
      sweepExpiredSessions(sessions, now);

      // If still over limit after sweep, evict oldest entries
      if (sessions.size >= MAX_SESSIONS) {
        const excess = sessions.size - MAX_SESSIONS + 1;
        evictOldest(sessions, excess);
      }
    }

    sessions.set(sessionId, session);
  };

  const del = (sessionId: string): void => {
    sessions.delete(sessionId);
  };

  return { get, set, delete: del };
};
