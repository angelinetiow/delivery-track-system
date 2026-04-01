import type { ReactNode } from "react";
import { Button } from "./Button";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-slate-50/80 px-6 py-12 text-center">
      <p className="text-sm font-medium text-text">{title}</p>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-text-muted">{description}</p>
      ) : null}
      {action ? (
        <Button className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

export function InlineEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border bg-slate-50 px-3 py-6 text-center text-sm text-text-muted">
      {children}
    </p>
  );
}
