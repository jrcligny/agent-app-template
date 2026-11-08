import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ActionRow({
  children,
  label = "Actions",
  className,
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap items-center justify-end gap-3", className)}>
      {children}
    </div>
  );
}
