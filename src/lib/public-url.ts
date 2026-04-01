/**
 * URL for a file in `public/`. Respects Vite `base` (e.g. GitHub Project Pages /repo/).
 */
export function publicUrl(path: string): string {
  const trimmed = path.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${trimmed}`;
}
