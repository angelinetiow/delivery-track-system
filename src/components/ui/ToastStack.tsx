import { useAppState } from "@/state/AppStateContext";
import { Button } from "./Button";

export function ToastStack() {
  const { toasts, dismissToast } = useAppState();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`flex items-start gap-3 rounded-lg border px-3 py-2 shadow-md ${
            t.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : t.tone === "error"
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-border bg-surface-raised text-text"
          }`}
        >
          <p className="flex-1 text-sm">{t.message}</p>
          <Button
            variant="ghost"
            size="sm"
            className="!h-7 shrink-0 !px-2 text-text-muted"
            onClick={() => dismissToast(t.id)}
          >
            Dismiss
          </Button>
        </div>
      ))}
    </div>
  );
}
