import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "out");
const distDir = path.join(root, "dist");

if (!existsSync(outDir)) {
  process.exit(0);
}

await rm(distDir, { recursive: true, force: true });
await cp(outDir, distDir, { recursive: true });

const distOpenAiDir = path.join(distDir, ".openai");
const sourceHostingConfig = path.join(root, ".openai", "hosting.json");

if (existsSync(sourceHostingConfig)) {
  await mkdir(distOpenAiDir, { recursive: true });
  await cp(sourceHostingConfig, path.join(distOpenAiDir, "hosting.json"));
}

const serverDir = path.join(distDir, "server");
await mkdir(serverDir, { recursive: true });

const fallbackHtmlPath = path.join(distDir, "index.html");
const fallbackHtml = existsSync(fallbackHtmlPath)
  ? await readFile(fallbackHtmlPath, "utf8")
  : "<!doctype html><html><body><div id=\"__next\">INEMA.AI MAP</div></body></html>";

await writeFile(
  path.join(serverDir, "index.js"),
  `const fallbackHtml = ${JSON.stringify(fallbackHtml)};

export default {
  async fetch(request, env) {
    if (env && env.ASSETS && typeof env.ASSETS.fetch === "function") {
      const response = await env.ASSETS.fetch(request);

      if (response.status !== 404) {
        return response;
      }
    }

    return new Response(fallbackHtml, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
};
`,
);

console.log("Prepared dist with static assets and App Garden server entrypoint.");
