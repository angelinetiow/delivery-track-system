import { copyFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

/**
 * Local / custom CI: override with VITE_BASE_PATH=/my-repo/ npm run build
 *
 * On GitHub Actions, `GITHUB_REPOSITORY` is always set (owner/repo). We derive
 * `base` from that so deploys work even if the workflow never passes VITE_BASE_PATH.
 * - Project repo → https://<owner>.github.io/<repo>/  → base `/<repo>/`
 * - User site repo `<owner>.github.io` → https://<owner>.github.io/  → base `/`
 *
 * Without this, a user-site repo built with base `/<name>.github.io/` loads HTML from
 * `/` but requests JS from `/<name>.github.io/assets/...` → 404 → blank page.
 */
function normalizeBase(raw: string | undefined): string {
  if (!raw?.trim()) return "/";
  let b = raw.trim();
  if (!b.startsWith("/")) b = `/${b}`;
  if (!b.endsWith("/")) b = `${b}/`;
  return b;
}

function baseFromGitHubActions(): string | null {
  if (process.env.GITHUB_ACTIONS !== "true") return null;
  const full = process.env.GITHUB_REPOSITORY;
  if (!full?.includes("/")) return null;
  const [owner, repo] = full.split("/", 2);
  if (!owner || !repo) return null;
  const repoLc = repo.toLowerCase();
  const ownerLc = owner.toLowerCase();
  if (repoLc === `${ownerLc}.github.io`) return "/";
  return `/${repo}/`;
}

const base = baseFromGitHubActions() ?? normalizeBase(process.env.VITE_BASE_PATH);

export default defineConfig({
  base,
  plugins: [
    react(),
    // GitHub Pages serves 404.html for unknown paths; copy SPA shell so deep links / refresh work.
    {
      name: "gh-pages-spa-fallback",
      closeBundle() {
        const indexHtml = join(rootDir, "dist/index.html");
        copyFileSync(indexHtml, join(rootDir, "dist/404.html"));
      },
    },
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
