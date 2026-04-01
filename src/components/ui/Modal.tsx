import { useEffect, type ReactNode } from "react";
import { Button } from "./Button";

export function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  size = "md",
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const w =
    size === "sm"
      ? "max-w-md"
      : size === "lg"
        ? "max-w-3xl"
        : "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative z-10 w-full ${w} rounded-xl border border-border bg-surface-raised shadow-md`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 id="modal-title" className="text-base font-semibold text-text">
            {title}
          </h2>
          <Button variant="ghost" size="sm" className="!px-2" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="max-h-[min(70vh,640px)] overflow-y-auto px-5 py-4">
          {children}
        </div>
        {footer ? (
          <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
