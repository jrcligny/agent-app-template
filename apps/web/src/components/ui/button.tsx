import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const buttonStyles = cva(
  "inline-flex min-h-11 w-fit max-w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "border-2 border-focus bg-accent text-accent-ink hover:ring-2 hover:ring-ink hover:ring-offset-2 hover:ring-offset-canvas",
        quiet: "border-2 border-focus bg-transparent text-secondary shadow-[inset_0_0_0_2px_var(--color-accent)]",
        danger: "border border-danger bg-danger-bg text-danger",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>;

export function Button({ className, variant, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonStyles({ variant }), className)} {...props} />;
}
