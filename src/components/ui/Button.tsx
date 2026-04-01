import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "bg-primary text-white hover:bg-primary-hover shadow-sm focus-visible:shadow-ring",
  secondary:
    "bg-surface-raised text-text border border-border hover:bg-slate-50 focus-visible:shadow-ring",
  ghost: "text-text-muted hover:bg-slate-100 hover:text-text focus-visible:shadow-ring",
  danger: "bg-danger text-white hover:bg-red-700 shadow-sm focus-visible:ring-2 focus-visible:ring-red-300",
  link: "text-primary hover:text-primary-hover underline-offset-2 hover:underline",
} as const;

const sizes = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-10 px-5 text-sm gap-2",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-45 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
