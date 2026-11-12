import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function SelectField({
  id,
  label,
  error,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { id: string; label: string; error?: string }) {
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink aria-[invalid=true]:border-danger",
          className,
        )}
      >
        {children}
      </select>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
