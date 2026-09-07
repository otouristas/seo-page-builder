import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

const onNetlify = Boolean(process.env.NETLIFY);

/**
 * Node server (local / VPS): `pg` and the WASM-heavy PGLite are loaded from node_modules at runtime.
 * Netlify uploads the function directory without bundling node_modules, so `pg` must be inlined there;
 * only its optional native binding and Cloudflare shim stay external (both are guarded at runtime).
 * PGLite is never bundled: it is loaded through a non-analyzable import and disabled on serverless hosts.
 */
const RUNTIME_EXTERNALS = onNetlify ? ["@electric-sql/pglite", "pg-native", "cloudflare:sockets"] : ["@electric-sql/pglite", "pg"];

/**
 * Nitro auto-detects Netlify, but pin it: the netlify preset writes the SSR function to
 * .netlify/functions-internal and static assets to dist/ (the publish dir in netlify.toml).
 * Everywhere else the default node-server preset builds .output/ for `npm start`.
 */
const preset = onNetlify ? "netlify" : undefined;

export default defineConfig({
  server: { port: 3000 },
  resolve: { tsconfigPaths: true },
  plugins: [tanstackStart(), nitro({ preset }), viteReact(), tailwindcss()],
  ssr: { external: RUNTIME_EXTERNALS },
  environments: {
    nitro: { resolve: { external: RUNTIME_EXTERNALS } },
  },
});
