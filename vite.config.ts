import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * GitHub **Project** Pages serves at https://<user>.github.io/<repo>/
 * Set VITE_BASE_PATH to "/<repo>/" when building for that URL, e.g.:
 *   VITE_BASE_PATH=/delivery-track-system/ npm run build
 * User/org site (repo named <user>.github.io) keeps base "/".
 */
function normalizeBase(raw: string | undefined): string {
  if (!raw?.trim()) return "/";
  let b = raw.trim();
  if (!b.startsWith("/")) b = `/${b}`;
  if (!b.endsWith("/")) b = `${b}/`;
  return b;
}

const base = normalizeBase(process.env.VITE_BASE_PATH);

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
