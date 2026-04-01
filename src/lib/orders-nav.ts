/** Build `/orders` URLs with query params for dashboard deep links. */
export function ordersUrl(params: Record<string, string | undefined | null>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") usp.set(k, v);
  }
  const q = usp.toString();
  return q ? `/orders?${q}` : "/orders";
}
