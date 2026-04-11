/**
 * Regression test: ensures every client app in src/client/apps/ is registered
 * in the Dockerfile bundle step and the deno.json build task.
 *
 * Prevents the 404 bug where a new app is added but its bundle is missing
 * from the Docker build.
 */

import { assertEquals } from "@std/assert";

const APPS_DIR = "src/client/apps";
const DOCKERFILE = "Dockerfile";
const DENO_JSON = "deno.json";

/** Recursively find directories under a path (1 level deep). */
const getAppNames = async (dir: string): Promise<readonly string[]> => {
  const names: string[] = [];
  for await (const entry of Deno.readDir(dir)) {
    if (entry.isDirectory) names.push(entry.name);
  }
  return names.sort();
};

Deno.test("Every client app has a bundle step in Dockerfile", async () => {
  const apps = await getAppNames(APPS_DIR);
  const dockerfile = await Deno.readTextFile(DOCKERFILE);

  for (const app of apps) {
    const bundleLine = `static/js/${app}.js`;
    assertEquals(
      dockerfile.includes(bundleLine),
      true,
      `Dockerfile missing bundle for app '${app}'. Add: deno bundle ... -o static/js/${app}.js src/client/apps/${app}/entry.tsx`,
    );
  }
});

Deno.test("Every client app has a bundle step in deno.json build task", async () => {
  const apps = await getAppNames(APPS_DIR);
  const denoJson = await Deno.readTextFile(DENO_JSON);

  for (const app of apps) {
    const bundleRef = `static/js/${app}.js`;
    assertEquals(
      denoJson.includes(bundleRef),
      true,
      `deno.json build task missing bundle for app '${app}'. Add auth-hub to the build task.`,
    );
  }
});

Deno.test("Every client app has an entry.tsx file", async () => {
  const apps = await getAppNames(APPS_DIR);

  for (const app of apps) {
    const entryPath = `${APPS_DIR}/${app}/entry.tsx`;
    try {
      await Deno.stat(entryPath);
    } catch {
      assertEquals(true, false, `Missing entry point: ${entryPath}`);
    }
  }
});

Deno.test("Every SSR page that references a JS bundle has a matching app", async () => {
  const pagesSource = await Deno.readTextFile("src/routes/pages.tsx");
  const apps = await getAppNames(APPS_DIR);

  // Extract all /static/js/*.js references from pages.tsx
  const bundleRefs = [...pagesSource.matchAll(/\/static\/js\/([a-z-]+)\.js/g)]
    .map((m) => m[1])
    .filter((v): v is string => v !== undefined);

  for (const ref of bundleRefs) {
    assertEquals(
      apps.includes(ref),
      true,
      `pages.tsx references bundle '${ref}.js' but no app '${ref}' exists in ${APPS_DIR}/`,
    );
  }
});
