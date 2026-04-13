// =============================================================================
// FetchLookupTables — Fetches lookup/domain tables from Social Care backend
// =============================================================================
// NOTE: This use case targets the Social Care backend (apiBaseUrl), NOT People Context.
// =============================================================================

import { err } from "../../../domain/shared/result.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FetchLookupTablesInput = Readonly<{
  tableName: string;
}>;

export type LookupItem = Readonly<{
  id: string;
  codigo: string;
  descricao: string;
  ativo: boolean;
}>;

export type FetchLookupTablesOutput = readonly LookupItem[];

export type FetchLookupTablesError = ProxyError | "EMPTY_TABLE_NAME";

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

type FetchLookupTablesDeps = Readonly<{
  backendProxy: BackendProxy;
}>;

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export const fetchLookupTables = (
  deps: FetchLookupTablesDeps,
): UseCase<FetchLookupTablesInput, FetchLookupTablesOutput, FetchLookupTablesError> =>
  async (input) => {
    // 1. Validate tableName
    const trimmed = input.tableName.trim();
    if (trimmed.length === 0) return err("EMPTY_TABLE_NAME");

    // 2. Proxy to Social Care backend
    const path = `/api/v1/dominios/${encodeURIComponent(trimmed)}`;
    return deps.backendProxy.get<FetchLookupTablesOutput>(path);
  };
