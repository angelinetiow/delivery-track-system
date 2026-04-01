import { useEffect, type ReactNode } from "react";
import { Button } from "./Button";

function ChevronBackIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

export function Drawer({
  open,
  title,
  children,
  onClose,
  footer,
  widthClass = "max-w-xl",
  /** Higher z-index when stacked over another drawer */
  stackLayer = false,
  /** `chevron-back`: no Close control — use top-left back chevron only */
  leading = "close",
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  widthClass?: string;
  stackLayer?: boolean;
  leading?: "close" | "chevron-back";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const overlayZ = stackLayer ? "z-[55]" : "z-40";
  const asideZ = stackLayer ? "z-[60]" : "z-50";

  return (
    <>
      <div
        className={`fixed inset-0 ${overlayZ} bg-slate-900/30 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 ${asideZ} flex h-full ${widthClass} w-full flex-col border-l border-border bg-surface-raised shadow-md transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-3 sm:px-5">
          {leading === "chevron-back" ? (
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-slate-100 hover:text-text"
              aria-label="Back"
              onClick={onClose}
            >
              <ChevronBackIcon />
            </button>
          ) : null}
          <h2
            className={`min-w-0 flex-1 text-base font-semibold text-text ${
              leading === "chevron-back" ? "pr-2" : ""
            }`}
          >
            {title}
          </h2>
          {leading === "close" ? (
            <Button variant="ghost" size="sm" className="!px-2" onClick={onClose}>
              Close
            </Button>
          ) : null}
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="border-t border-border px-5 py-6">{footer}</div>
        ) : null}
      </aside>
    </>
  );
}
