// Lookup service — caches lookup tables (dominios) in memory.

import { type Result, type ServiceError, get } from "./base-client.ts";

export type LookupItem = Readonly<{
  id: string;
  code: string;
  description: string;
  active: boolean;
}>;

const cache = new Map<string, readonly LookupItem[]>();

export const lookupService = {
  getTable: async (
    tableName: string,
  ): Promise<Result<readonly LookupItem[], ServiceError>> => {
    const cached = cache.get(tableName);
    if (cached) return { ok: true, value: cached };

    const result = await get<readonly LookupItem[]>(
      `/api/v1/lookups/${tableName}`,
    );
    if (result.ok) cache.set(tableName, result.value);
    return result;
  },

  clearCache: (): void => {
    cache.clear();
  },
} as const;
