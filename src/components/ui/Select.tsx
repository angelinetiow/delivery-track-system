import type { SelectHTMLAttributes } from "react";

export function Select({
  className = "",
  error,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <div className="w-full">
      <select
        className={`h-9 w-full rounded-lg border bg-surface-raised px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          error ? "border-danger" : "border-border"
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
