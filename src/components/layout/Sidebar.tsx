import { NavLink } from "react-router-dom";
import { useShellLayout } from "./ShellLayoutContext";

const links = [
  { to: "/", label: "Dashboard", end: true as boolean },
  { to: "/route-planning", label: "Route and driver assignment", end: false },
  { to: "/orders", label: "Orders & tracking", end: false },
] as const;

export function Sidebar() {
  const { setSidebarOpen } = useShellLayout();

  return (
    <aside className="flex h-full min-h-0 w-56 flex-col overflow-y-auto bg-surface-raised">
      <div className="flex items-center justify-between px-3 py-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white"
          aria-hidden
        >
          DT
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg border border-border p-1.5 text-text-muted hover:bg-slate-50 hover:text-text"
          aria-label="Hide navigation sidebar"
          title="Hide sidebar"
          onClick={() => setSidebarOpen(false)}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-2" aria-label="Main">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `block rounded-lg border-l-4 py-2.5 pl-3 pr-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary bg-secondary-muted text-primary shadow-sm"
                  : "border-transparent text-text-muted hover:bg-slate-50 hover:text-text"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
