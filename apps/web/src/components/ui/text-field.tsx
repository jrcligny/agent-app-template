import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink aria-[invalid=true]:border-danger";

type Shared = {
  id: string;
  label: string;
  error?: string;
};

type InputProps = Shared & InputHTMLAttributes<HTMLInputElement> & { multiline?: false };
type TextAreaProps = Shared & TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true };

export function TextField(props: InputProps | TextAreaProps) {
  const { id, label, error } = props;
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {props.multiline ? <Area {...props} describedBy={describedBy} /> : <Input {...props} describedBy={describedBy} />}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Input({
  id,
  label: _label,
  error,
  multiline: _multiline,
  className,
  describedBy,
  ...rest
}: InputProps & { describedBy?: string }) {
  return (
    <input
      {...rest}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={cn(control, className)}
    />
  );
}

function Area({
  id,
  label: _label,
  error,
  multiline: _multiline,
  className,
  describedBy,
  ...rest
}: TextAreaProps & { describedBy?: string }) {
  return (
    <textarea
      {...rest}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={cn(control, "min-h-28", className)}
    />
  );
}
