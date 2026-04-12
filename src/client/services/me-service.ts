// Client service for GET /api/v1/me — returns current user profile and permitted apps.
// All requests go through the BFF (same-origin). Never talks to backend directly.

import { get } from "./base-client.ts";
import type { Result, ServiceError } from "./base-client.ts";

export type AppInfo = Readonly<{
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}>;

export type MeResponse = Readonly<{
  name: string;
  firstName: string;
  initials: string;
  role: string;
  apps: readonly AppInfo[];
  lastUsedAppId: string | null;
}>;

export const meService = {
  getMe: (): Promise<Result<MeResponse, ServiceError>> =>
    get<MeResponse>("/api/v1/me"),
};
