import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useLayerFocus } from "./use-layer-focus";

export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useLayerFocus(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-10 flex justify-end bg-ink/30">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="grid h-full w-full max-w-md content-start gap-4 overflow-y-auto border-l border-line bg-surface p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="drawer-title" className="text-lg font-semibold">
            {title}
          </h2>
          <Button variant="quiet" onClick={onClose}>
            Close summary
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
