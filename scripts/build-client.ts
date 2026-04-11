/**
 * Build client-side app bundles using Deno's built-in bundler.
 * Output: static/js/<app-name>.js
 *
 * Usage: deno run -A scripts/build-client.ts
 */

const APPS = ["social-care", "registration", "family-composition"] as const;
const OUT_DIR = "static/js";

await Deno.mkdir(OUT_DIR, { recursive: true });

console.log("Building client bundles with deno bundle...\n");

for (const app of APPS) {
  const entryPoint = `src/client/apps/${app}/entry.tsx`;
  const outFile = `${OUT_DIR}/${app}.js`;
  console.log(`  → ${app}: ${entryPoint}`);

  const cmd = new Deno.Command("deno", {
    args: ["bundle", entryPoint, outFile],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stderr } = await cmd.output();

  if (code === 0) {
    const stat = await Deno.stat(outFile);
    const sizeKb = (stat.size / 1024).toFixed(1);
    console.log(`    ✓ ${outFile} (${sizeKb} KB)`);
  } else {
    const errText = new TextDecoder().decode(stderr);
    console.error(`    ✗ Failed:\n${errText}`);
  }
}

console.log("\nDone.");
