import { useEffect, useState, type InputHTMLAttributes } from "react";
import { useShellLayout } from "./ShellLayoutContext";

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function HeaderSearch({
  placeholder,
  "aria-label": ariaLabel,
  onChange,
}: Pick<InputHTMLAttributes<HTMLInputElement>, "placeholder" | "onChange" | "aria-label">) {
  return (
    <div className="relative w-full min-w-0">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
        <SearchIcon />
      </span>
      <input
        type="search"
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={onChange}
        className="h-9 w-full min-w-0 rounded-lg border border-border bg-surface-raised py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function LiveClock({ clock }: { clock: Date }) {
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-slate-50 px-2 py-1 font-mono text-2xs text-text-muted">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" aria-hidden />
      Live
      <span className="mx-1 text-border-strong">|</span>
      {clock.toLocaleString(undefined, {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </div>
  );
}

function ProfileBadge() {
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-lg border border-border px-2 py-1">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-text">
        AO
      </div>
      <div className="hidden text-left sm:block">
        <p className="text-xs font-medium text-text">Angeline Admin</p>
        <p className="text-2xs text-text-muted">ops.admin@biomed.internal</p>
      </div>
    </div>
  );
}

export function TopBar({
  title,
  subtitle,
  searchPlaceholder = "Search orders, drivers, destinations…",
  onSearchChange,
}: {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearchChange?: (q: string) => void;
}) {
  const { sidebarOpen, setSidebarOpen } = useShellLayout();
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-surface-raised/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-surface-raised/80">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="flex min-w-0 items-start gap-2 lg:max-w-xl lg:flex-1">
          {!sidebarOpen ? (
            <button
              type="button"
              className="mt-0.5 shrink-0 rounded-lg border border-border p-2 text-text-muted hover:bg-slate-50 hover:text-primary"
              aria-label="Show navigation sidebar"
              title="Show sidebar"
              onClick={() => setSidebarOpen(true)}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-primary">{title}</h1>
            {subtitle ? <p className="text-sm text-text-muted">{subtitle}</p> : null}
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2 sm:items-end lg:ml-auto lg:w-auto lg:max-w-md xl:max-w-lg">
          <div className="flex w-full flex-wrap items-center justify-end gap-2">
            <LiveClock clock={clock} />
            <ProfileBadge />
          </div>
          <div className="w-full min-w-0 sm:max-w-md lg:w-full">
            <HeaderSearch
              placeholder={searchPlaceholder}
              aria-label="Global search"
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
