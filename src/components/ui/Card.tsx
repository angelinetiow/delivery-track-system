import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  padding = "p-5",
}: {
  children: ReactNode;
  className?: string;
  padding?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface-raised shadow-sm ${padding} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
  description,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  description?: string;
  className?: string;
}) {
  return (
    <div className={`mb-4 flex items-start justify-between gap-3 ${className}`.trim()}>
      <div className="min-w-0 flex-1">
        <h2 className="break-words text-base font-semibold text-text">{title}</h2>
        {description ? (
          <p className="mt-0.5 break-words text-sm text-text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pt-0.5">{action}</div> : null}
    </div>
  );
}
