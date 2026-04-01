import type { ReactNode } from "react";

export function StatusChip({
  children,
  tone,
  className = "",
}: {
  children: ReactNode;
  tone: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide ring-1 ring-inset ${tone} ${className}`}
    >
      {children}
    </span>
  );
}
