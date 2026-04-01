import type { ReactNode } from "react";
import { TopBar } from "./TopBar";

/** Full-height module: sticky TopBar, body scrolls independently below. */
export function PageScaffold({
  title,
  subtitle,
  searchPlaceholder,
  onSearchChange,
  children,
}: {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearchChange?: (q: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar
        title={title}
        subtitle={subtitle}
        searchPlaceholder={searchPlaceholder}
        onSearchChange={onSearchChange}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
