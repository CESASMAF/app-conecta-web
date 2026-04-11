import { assertEquals, assertNotEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { hubReducer, getRedirectApp, getGreeting } from "../../../src/client/viewmodels/auth-hub/reducer.ts";
import { initialState } from "../../../src/client/viewmodels/auth-hub/types.ts";
import { AUTH_HUB_STRINGS } from "../../../src/client/viewmodels/auth-hub/strings.ts";
import type { AppInfo, HubState, HubUser } from "../../../src/client/viewmodels/auth-hub/types.ts";

const makeApp = (overrides: Partial<AppInfo> = {}): AppInfo => ({
  id: "social",
  name: "Assist\u00eancia Social",
  description: "Fam\u00edlias e cadastros",
  icon: "<svg/>",
  color: "#4F8448",
  route: "/social-care",
  ...overrides,
});

const makeUser = (): HubUser => ({
  name: "Maria Silva",
  firstName: "Maria",
  initials: "MS",
  role: "Assistente Social",
});

describe("hubReducer", () => {
  it("INIT_SESSION_CHECK sets loading screen with authenticating context", () => {
    const result = hubReducer(initialState, { type: "INIT_SESSION_CHECK" });
    assertEquals(result.screen, "loading");
    assertEquals(result.loadingContext, "authenticating");
  });

  it("NO_SESSION sets landing screen with no error", () => {
    const state: HubState = { ...initialState, screen: "loading", loadingContext: "authenticating" };
    const result = hubReducer(state, { type: "NO_SESSION" });
    assertEquals(result.screen, "landing");
    assertEquals(result.loadingContext, null);
    assertEquals(result.error, null);
  });

  it("SESSION_EXPIRED sets landing with session error", () => {
    const state: HubState = { ...initialState, screen: "hub", user: makeUser() };
    const result = hubReducer(state, { type: "SESSION_EXPIRED" });
    assertEquals(result.screen, "landing");
    assertEquals(result.error?.type, "session");
    assertEquals(result.error?.title, AUTH_HUB_STRINGS.sessionExpiredTitle);
    assertEquals(result.error?.message, AUTH_HUB_STRINGS.sessionExpiredDesc);
    assertEquals(result.user, null);
  });

  it("AUTH_START sets loading screen with authenticating context and clears error", () => {
    const state: HubState = {
      ...initialState,
      error: { type: "auth", title: "err", message: "msg" },
    };
    const result = hubReducer(state, { type: "AUTH_START" });
    assertEquals(result.screen, "loading");
    assertEquals(result.loadingContext, "authenticating");
    assertEquals(result.error, null);
  });

  it("AUTH_CALLBACK_SUCCESS with 0 apps goes to hub screen", () => {
    const result = hubReducer(initialState, {
      type: "AUTH_CALLBACK_SUCCESS",
      user: makeUser(),
      apps: [],
      lastUsedAppId: null,
    });
    assertEquals(result.screen, "hub");
    assertEquals<HubUser | null>(result.user, makeUser());
    assertEquals(result.apps.length, 0);
    assertEquals(result.lastUsedAppId, null);
    assertEquals(result.error, null);
    assertEquals(result.loadingContext, null);
  });

  it("AUTH_CALLBACK_SUCCESS with 1 app goes to redirect screen", () => {
    const app = makeApp();
    const result = hubReducer(initialState, {
      type: "AUTH_CALLBACK_SUCCESS",
      user: makeUser(),
      apps: [app],
      lastUsedAppId: null,
    });
    assertEquals(result.screen, "redirect");
    assertEquals(result.apps, [app]);
    assertEquals(result.lastUsedAppId, "social");
    assertEquals(result.loadingContext, null);
  });

  it("AUTH_CALLBACK_SUCCESS with 2+ apps goes to hub screen", () => {
    const apps = [makeApp(), makeApp({ id: "admin", name: "Admin", route: "/admin" })];
    const result = hubReducer(initialState, {
      type: "AUTH_CALLBACK_SUCCESS",
      user: makeUser(),
      apps,
      lastUsedAppId: "social",
    });
    assertEquals(result.screen, "hub");
    assertEquals(result.apps.length, 2);
    assertEquals(result.lastUsedAppId, "social");
    assertEquals(result.loadingContext, null);
  });

  it("AUTH_CALLBACK_SUCCESS preserves lastUsedAppId when provided", () => {
    const apps = [makeApp(), makeApp({ id: "admin", name: "Admin", route: "/admin" })];
    const result = hubReducer(initialState, {
      type: "AUTH_CALLBACK_SUCCESS",
      user: makeUser(),
      apps,
      lastUsedAppId: "admin",
    });
    assertEquals(result.lastUsedAppId, "admin");
  });

  it("AUTH_CALLBACK_FAILURE sets landing with auth error", () => {
    const state: HubState = { ...initialState, screen: "loading", loadingContext: "authenticating" };
    const result = hubReducer(state, {
      type: "AUTH_CALLBACK_FAILURE",
      title: "Falha",
      message: "Credenciais inv\u00e1lidas",
    });
    assertEquals(result.screen, "landing");
    assertEquals(result.loadingContext, null);
    assertEquals(result.error?.type, "auth");
    assertEquals(result.error?.title, "Falha");
    assertEquals(result.error?.message, "Credenciais inv\u00e1lidas");
  });

  it("LOAD_PERMISSIONS_START sets loading with loading-permissions context", () => {
    const state: HubState = {
      ...initialState,
      screen: "hub",
      user: makeUser(),
      error: { type: "network", title: "err", message: "msg" },
    };
    const result = hubReducer(state, { type: "LOAD_PERMISSIONS_START" });
    assertEquals(result.screen, "loading");
    assertEquals(result.loadingContext, "loading-permissions");
    assertEquals(result.error, null);
  });

  it("LOAD_PERMISSIONS_SUCCESS with 1 app goes to redirect", () => {
    const app = makeApp();
    const state: HubState = { ...initialState, screen: "loading", user: makeUser() };
    const result = hubReducer(state, {
      type: "LOAD_PERMISSIONS_SUCCESS",
      apps: [app],
      lastUsedAppId: null,
    });
    assertEquals(result.screen, "redirect");
    assertEquals(result.lastUsedAppId, "social");
    assertEquals(result.loadingContext, null);
  });

  it("LOAD_PERMISSIONS_SUCCESS with 2+ apps goes to hub", () => {
    const apps = [makeApp(), makeApp({ id: "admin", name: "Admin", route: "/admin" })];
    const state: HubState = { ...initialState, screen: "loading", user: makeUser() };
    const result = hubReducer(state, {
      type: "LOAD_PERMISSIONS_SUCCESS",
      apps,
      lastUsedAppId: "social",
    });
    assertEquals(result.screen, "hub");
    assertEquals(result.apps.length, 2);
    assertEquals(result.lastUsedAppId, "social");
  });

  it("LOAD_PERMISSIONS_SUCCESS with 0 apps goes to hub", () => {
    const state: HubState = { ...initialState, screen: "loading", user: makeUser() };
    const result = hubReducer(state, {
      type: "LOAD_PERMISSIONS_SUCCESS",
      apps: [],
      lastUsedAppId: null,
    });
    assertEquals(result.screen, "hub");
    assertEquals(result.apps.length, 0);
  });

  it("LOAD_PERMISSIONS_FAILURE sets hub with network error", () => {
    const state: HubState = { ...initialState, screen: "loading", user: makeUser() };
    const result = hubReducer(state, { type: "LOAD_PERMISSIONS_FAILURE" });
    assertEquals(result.screen, "hub");
    assertEquals(result.error?.type, "network");
    assertEquals(result.error?.title, AUTH_HUB_STRINGS.networkErrorTitle);
    assertEquals(result.error?.message, AUTH_HUB_STRINGS.networkErrorDesc);
    assertEquals(result.loadingContext, null);
  });

  it("SELECT_APP sets loading with entering-app context and updates lastUsedAppId", () => {
    const state: HubState = {
      ...initialState,
      screen: "hub",
      user: makeUser(),
      apps: [makeApp()],
    };
    const result = hubReducer(state, { type: "SELECT_APP", appId: "social" });
    assertEquals(result.screen, "loading");
    assertEquals(result.loadingContext, "entering-app");
    assertEquals(result.lastUsedAppId, "social");
  });

  it("LOGOUT_START sets loading with authenticating context", () => {
    const state: HubState = { ...initialState, screen: "hub", user: makeUser() };
    const result = hubReducer(state, { type: "LOGOUT_START" });
    assertEquals(result.screen, "loading");
    assertEquals(result.loadingContext, "authenticating");
  });

  it("LOGOUT_COMPLETE resets to initial state with landing screen", () => {
    const state: HubState = {
      ...initialState,
      screen: "hub",
      user: makeUser(),
      apps: [makeApp()],
      lastUsedAppId: "social",
    };
    const result = hubReducer(state, { type: "LOGOUT_COMPLETE" });
    assertEquals(result.screen, "landing");
    assertEquals(result.user, null);
    assertEquals(result.apps.length, 0);
    assertEquals(result.lastUsedAppId, null);
    assertEquals(result.loadingContext, null);
    assertEquals(result.error, null);
  });
});

describe("getRedirectApp", () => {
  it("returns the single app when screen is redirect and 1 app", () => {
    const app = makeApp();
    const state: HubState = {
      ...initialState,
      screen: "redirect",
      apps: [app],
    };
    assertEquals(getRedirectApp(state), app);
  });

  it("returns null when screen is not redirect", () => {
    const state: HubState = {
      ...initialState,
      screen: "hub",
      apps: [makeApp()],
    };
    assertEquals(getRedirectApp(state), null);
  });

  it("returns null when redirect but multiple apps", () => {
    const state: HubState = {
      ...initialState,
      screen: "redirect",
      apps: [makeApp(), makeApp({ id: "admin" })],
    };
    assertEquals(getRedirectApp(state), null);
  });
});

describe("getGreeting", () => {
  it("returns a greeting string containing the first name", () => {
    const result = getGreeting("Maria");
    assertNotEquals(result.indexOf("Maria"), -1);
  });

  it("returns a greeting with a period-of-day prefix", () => {
    const result = getGreeting("Jo\u00e3o");
    const validPrefixes = ["Bom dia", "Boa tarde", "Boa noite"];
    const hasPrefix = validPrefixes.some((p) => result.startsWith(p));
    assertEquals(hasPrefix, true);
  });

  it("matches the AUTH_HUB_STRINGS.greeting function output", () => {
    const name = "Carlos";
    assertEquals(getGreeting(name), AUTH_HUB_STRINGS.greeting(name));
  });
});
