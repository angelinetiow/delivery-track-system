import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Input({
  className = "",
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div className="w-full min-w-0">
      <input
        className={`h-9 w-full min-w-0 rounded-lg border bg-surface-raised px-3 text-sm text-text placeholder:text-text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          error ? "border-danger" : "border-border"
        } ${className}`}
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function TextArea({
  className = "",
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <div className="w-full">
      <textarea
        className={`min-h-[88px] w-full rounded-lg border bg-surface-raised px-3 py-2 text-sm text-text placeholder:text-text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          error ? "border-danger" : "border-border"
        } ${className}`}
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function Label({
  children,
  htmlFor,
  required,
}: {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-medium text-text-muted"
    >
      {children}
      {required ? <span className="text-danger"> *</span> : null}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-danger">{message}</p>;
}
