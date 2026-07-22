import { defineConfig, loadEnv, type Plugin } from "vite";
import { writeFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

function resolveBuildId(): string {
  const env = process.env.GITHUB_SHA?.trim();
  if (env) return env.slice(0, 12);
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return String(Date.now());
  }
}

function appVersionPlugin(buildId: string): Plugin {
  return {
    name: "donna-app-version",
    writeBundle(options) {
      const outDir = options.dir ?? "dist";
      writeFileSync(
        join(outDir, "version.json"),
        JSON.stringify({ build: buildId }),
        "utf8"
      );
    },
  };
}

function donnaEnvPlugin(env: Record<string, string>): Plugin {
  const keys = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "VITE_HOUSEHOLD_ID",
  ] as const;

  return {
    name: "donna-env",
    transformIndexHtml(html) {
      const injected: Record<string, string> = {};
      for (const key of keys) {
        const value = (process.env[key] ?? env[key])?.trim();
        if (value) injected[key] = value;
      }
      const snippet = `<script>window.__DONNA_ENV__=${JSON.stringify(injected)};</script>`;
      return html.replace("</head>", `${snippet}\n</head>`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const buildId = resolveBuildId();
  return {
    base: "/the-daily-donna/",
    plugins: [donnaEnvPlugin(env), appVersionPlugin(buildId)],
  };
});
