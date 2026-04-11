import { assertEquals } from "@std/assert";
import { lookupService } from "../../../src/client/services/lookup-service.ts";

const mockFetch = (response: Response): () => void => {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => response) as unknown as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
};

Deno.test("lookupService.getTable - fetches and caches", async () => {
  let fetchCount = 0;
  const original = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetchCount++;
    return new Response(
      JSON.stringify({
        data: [{ id: "1", code: "REL_PARENT", description: "Pai/Mae", active: true }],
      }),
      { status: 200 },
    );
  }) as unknown as typeof fetch;
  try {
    lookupService.clearCache();
    const first = await lookupService.getTable("relationships");
    assertEquals(first.ok, true);
    if (first.ok) assertEquals(first.value.length, 1);
    assertEquals(fetchCount, 1);

    const second = await lookupService.getTable("relationships");
    assertEquals(second.ok, true);
    assertEquals(fetchCount, 1); // Cache hit, no second fetch
  } finally {
    globalThis.fetch = original;
    lookupService.clearCache();
  }
});

Deno.test("lookupService.getTable - does not cache errors", async () => {
  let fetchCount = 0;
  const original = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetchCount++;
    if (fetchCount === 1) {
      return new Response(null, { status: 500 });
    }
    return new Response(
      JSON.stringify({ data: [{ id: "1", code: "X", description: "Y", active: true }] }),
      { status: 200 },
    );
  }) as unknown as typeof fetch;
  try {
    lookupService.clearCache();
    const first = await lookupService.getTable("bad-table");
    assertEquals(first.ok, false);

    const second = await lookupService.getTable("bad-table");
    assertEquals(second.ok, true);
    assertEquals(fetchCount, 2); // Re-fetched after error
  } finally {
    globalThis.fetch = original;
    lookupService.clearCache();
  }
});

Deno.test("lookupService.clearCache - clears all cached entries", async () => {
  let fetchCount = 0;
  const original = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetchCount++;
    return new Response(
      JSON.stringify({ data: [] }),
      { status: 200 },
    );
  }) as unknown as typeof fetch;
  try {
    lookupService.clearCache();
    await lookupService.getTable("specificities");
    assertEquals(fetchCount, 1);

    lookupService.clearCache();
    await lookupService.getTable("specificities");
    assertEquals(fetchCount, 2); // Re-fetched after clear
  } finally {
    globalThis.fetch = original;
    lookupService.clearCache();
  }
});
