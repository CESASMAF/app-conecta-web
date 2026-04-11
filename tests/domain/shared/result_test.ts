import { assertEquals } from "@std/assert";
import {
  combine,
  err,
  flatMap,
  isErr,
  isOk,
  map,
  mapErr,
  ok,
  unwrapOr,
} from "../../../src/domain/shared/result.ts";

Deno.test("ok creates a success result", () => {
  const result = ok(42);
  assertEquals(result.ok, true);
  assertEquals(result.value, 42);
});

Deno.test("err creates a failure result", () => {
  const result = err("NOT_FOUND" as const);
  assertEquals(result.ok, false);
  assertEquals(result.error, "NOT_FOUND");
});

Deno.test("isOk narrows to Ok", () => {
  const result = ok("hello");
  assertEquals(isOk(result), true);
  assertEquals(isErr(result), false);
});

Deno.test("isErr narrows to Err", () => {
  const result = err("FAIL" as const);
  assertEquals(isErr(result), true);
  assertEquals(isOk(result), false);
});

Deno.test("map transforms value on Ok", () => {
  const result = map(ok(2), (n) => n * 3);
  assertEquals(result, ok(6));
});

Deno.test("map passes through Err", () => {
  const result = map(err("FAIL" as const), (n: number) => n * 3);
  assertEquals(result, err("FAIL"));
});

Deno.test("flatMap chains on Ok", () => {
  const result = flatMap(ok(10), (n) =>
    n > 0 ? ok(n) : err("NEGATIVE" as const));
  assertEquals(result, ok(10));
});

Deno.test("flatMap short-circuits on Err", () => {
  const result = flatMap(err("FIRST" as const), (_n: number) =>
    ok(42));
  assertEquals(result, err("FIRST"));
});

Deno.test("mapErr transforms error", () => {
  const result = mapErr(err("A" as const), (e) => `wrapped:${e}`);
  assertEquals(result, err("wrapped:A"));
});

Deno.test("mapErr passes through Ok", () => {
  const result = mapErr(ok(1), (e: string) => `wrapped:${e}`);
  assertEquals(result, ok(1));
});

Deno.test("unwrapOr returns value on Ok", () => {
  assertEquals(unwrapOr(ok(5), 0), 5);
});

Deno.test("unwrapOr returns fallback on Err", () => {
  assertEquals(unwrapOr(err("FAIL"), 0), 0);
});

Deno.test("combine collects all Ok values", () => {
  const result = combine([ok(1), ok(2), ok(3)]);
  assertEquals(result, ok([1, 2, 3]));
});

Deno.test("combine short-circuits on first Err", () => {
  const result = combine([ok(1), err("SECOND" as const), ok(3)]);
  assertEquals(result, err("SECOND"));
});

Deno.test("combine returns Ok with empty array for empty input", () => {
  const result = combine([]);
  assertEquals(result, ok([]));
});
