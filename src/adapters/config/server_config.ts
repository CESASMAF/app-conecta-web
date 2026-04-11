// Server configuration — reads environment variables into a typed, immutable config.
// Allowed to throw here (adapter boundary) if required vars are missing.

export type ServerConfig = Readonly<{
  port: number;
  host: string;
  sessionTtlMinutes: number;
  apiBaseUrl: string;
  peopleContextBaseUrl: string;
  oidc: Readonly<{
    issuer: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  }>;
  sessionSecret: string;
  secureCookies: boolean;
}>;

const requireEnv = (key: string): string => {
  const value = Deno.env.get(key);
  if (value === undefined || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
};

const optionalEnv = (key: string, fallback: string): string => {
  const value = Deno.env.get(key);
  return value !== undefined && value.trim() !== "" ? value.trim() : fallback;
};

export const loadConfig = (): ServerConfig => ({
  port: Number(optionalEnv("PORT", "8081")),
  host: optionalEnv("HOST", "0.0.0.0"),
  sessionTtlMinutes: Number(optionalEnv("SESSION_TTL_MINUTES", "60")),
  apiBaseUrl: requireEnv("API_BASE_URL"),
  peopleContextBaseUrl: requireEnv("PEOPLE_CONTEXT_BASE_URL"),
  oidc: {
    issuer: requireEnv("OIDC_ISSUER"),
    clientId: requireEnv("OIDC_CLIENT_ID"),
    clientSecret: requireEnv("OIDC_CLIENT_SECRET"),
    redirectUri: requireEnv("OIDC_REDIRECT_URI"),
  },
  sessionSecret: requireEnv("SESSION_SECRET"),
  secureCookies: requireEnv("OIDC_REDIRECT_URI").startsWith("https://"),
});
