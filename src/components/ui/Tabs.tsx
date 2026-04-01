import type { ReactNode } from "react";

export type TabItem = { id: string; label: string; badge?: number };

/**
 * Full-width segmented control — avoids tabs floating in the middle of the card.
 */
export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      role="tablist"
      className="mt-5 w-full rounded-xl border border-border bg-slate-100/80 p-1 shadow-inner"
    >
      <div className="grid gap-1 sm:grid-cols-2">
        {tabs.map((t) => {
          const isOn = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={isOn}
              onClick={() => onChange(t.id)}
              className={`flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                isOn
                  ? "bg-surface-raised text-primary shadow-sm ring-1 ring-border"
                  : "text-text-muted hover:bg-slate-50/90 hover:text-text"
              }`}
            >
              <span>{t.label}</span>
              {t.badge != null && t.badge > 0 ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-2xs font-bold tabular-nums ${
                    isOn ? "bg-primary-muted text-primary" : "bg-slate-200/80 text-text-muted"
                  }`}
                >
                  {t.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TabPanel({
  id,
  active,
  children,
}: {
  id: string;
  active: string;
  children: ReactNode;
}) {
  if (id !== active) return null;
  return (
    <div role="tabpanel" className="pt-5">
      {children}
    </div>
  );
}
