import { assertEquals } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { ok, err } from "../../../src/domain/shared/result.ts";
import type { Result } from "../../../src/domain/shared/result.ts";
import { fetchLookupTables } from "../../../src/application/people/use-cases/fetch_lookup_tables.ts";
import type { BackendProxy, ProxyError } from "../../../src/application/shared/types.ts";

const mockBackendProxy = (response: Result<unknown, ProxyError>): BackendProxy => ({
  get: async <T>(): Promise<Result<T, ProxyError>> => response as Result<T, ProxyError>,
  post: async <T>(): Promise<Result<T, ProxyError>> => err("SERVER_ERROR") as unknown as Result<T, ProxyError>,
  put: async <T>(): Promise<Result<T, ProxyError>> => err("SERVER_ERROR") as unknown as Result<T, ProxyError>,
  delete: async (): Promise<Result<void, ProxyError>> => err("SERVER_ERROR"),
});

describe("FetchLookupTables", () => {
  it("should validate and proxy lookup fetch", async () => {
    const items = [{ id: "1", codigo: "001", descricao: "Item 1", ativo: true }];
    let calledPath = "";
    const proxy: BackendProxy = {
      get: async <T>(path: string): Promise<Result<T, ProxyError>> => {
        calledPath = path;
        return ok(items) as unknown as Result<T, ProxyError>;
      },
      post: async <T>(): Promise<Result<T, ProxyError>> => err("SERVER_ERROR") as unknown as Result<T, ProxyError>,
      put: async <T>(): Promise<Result<T, ProxyError>> => err("SERVER_ERROR") as unknown as Result<T, ProxyError>,
      delete: async (): Promise<Result<void, ProxyError>> => err("SERVER_ERROR"),
    };

    const result = await fetchLookupTables({ backendProxy: proxy })({ tableName: "genero" });

    assertEquals(result.ok, true);
    if (result.ok) assertEquals(result.value, items);
    assertEquals(calledPath, "/api/v1/dominios/genero");
  });

  it("should reject empty tableName", async () => {
    const proxy = mockBackendProxy(ok([]));

    const result = await fetchLookupTables({ backendProxy: proxy })({ tableName: "   " });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "EMPTY_TABLE_NAME");
  });

  it("should return proxy error on failure", async () => {
    const proxy = mockBackendProxy(err("SERVER_ERROR"));

    const result = await fetchLookupTables({ backendProxy: proxy })({ tableName: "genero" });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "SERVER_ERROR");
  });

  it("should encode special characters in tableName", async () => {
    let calledPath = "";
    const proxy: BackendProxy = {
      get: async <T>(path: string): Promise<Result<T, ProxyError>> => {
        calledPath = path;
        return ok([]) as unknown as Result<T, ProxyError>;
      },
      post: async <T>(): Promise<Result<T, ProxyError>> => err("SERVER_ERROR") as unknown as Result<T, ProxyError>,
      put: async <T>(): Promise<Result<T, ProxyError>> => err("SERVER_ERROR") as unknown as Result<T, ProxyError>,
      delete: async (): Promise<Result<void, ProxyError>> => err("SERVER_ERROR"),
    };

    await fetchLookupTables({ backendProxy: proxy })({ tableName: "tipo raca" });

    assertEquals(calledPath, "/api/v1/dominios/tipo%20raca");
  });
});
