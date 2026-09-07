import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

/** Packages that ship WASM/native assets and must be loaded from node_modules at runtime. */
const RUNTIME_EXTERNALS = ["@electric-sql/pglite", "pg"];

export default defineConfig({
  server: { port: 3000 },
  resolve: { tsconfigPaths: true },
  plugins: [tanstackStart(), nitro(), viteReact(), tailwindcss()],
  ssr: { external: RUNTIME_EXTERNALS },
  environments: {
    nitro: { resolve: { external: RUNTIME_EXTERNALS } },
  },
});
