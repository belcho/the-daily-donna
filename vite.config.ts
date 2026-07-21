import { defineConfig, loadEnv, type Plugin } from "vite";

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
  return {
    base: "/the-daily-donna/",
    plugins: [donnaEnvPlugin(env)],
  };
});
