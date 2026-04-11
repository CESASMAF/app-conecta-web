import { Hono } from "@hono/hono";
import type { AppEnv } from "../types.ts";

export const healthRoutes = new Hono<AppEnv>();

healthRoutes.get("/health", (c) => {
  return c.json({ status: "ok" });
});

healthRoutes.get("/ready", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});
