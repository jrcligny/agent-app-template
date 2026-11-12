import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <article
      className={cn("rounded-lg border border-line bg-surface p-4", className)}
      {...props}
    />
  );
}
