import { LIVE_TRACKING_MAP_URL } from "@/lib/map-assets";

export function MapPanel({
  title = "Map preview",
  subtitle,
  badge,
  /** Override background image (defaults to bundled mock map). */
  mapImageUrl = LIVE_TRACKING_MAP_URL,
}: {
  title?: string;
  subtitle?: string;
  badge?: string;
  mapImageUrl?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-slate-100">
      <div
        className="relative h-56 w-full bg-cover bg-center sm:h-72"
        style={{ backgroundImage: `url(${mapImageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-white drop-shadow">{title}</p>
            {subtitle ? (
              <p className="text-xs text-white/90 drop-shadow">{subtitle}</p>
            ) : null}
          </div>
          {badge ? (
            <span className="rounded-md bg-white/95 px-2 py-1 text-2xs font-semibold uppercase text-text shadow-sm">
              {badge}
            </span>
          ) : null}
        </div>
      </div>
      <p className="border-t border-border bg-surface-raised px-3 py-2 text-2xs text-text-muted">
        Static mock map image for demo — production would stream live GPS and turn-by-turn routing.
      </p>
    </div>
  );
}
