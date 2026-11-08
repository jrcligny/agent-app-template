import { Button } from "@/components/ui/button";
import { useLayerFocus } from "./use-layer-focus";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onDismiss,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const ref = useLayerFocus(open, onDismiss);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-ink/30 p-4">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="grid w-full max-w-md gap-4 rounded-lg border border-line bg-surface p-4"
      >
        <div className="grid gap-1">
          <h2 id="confirm-title" className="text-lg font-semibold">
            {title}
          </h2>
          <p className="text-sm text-muted">{description}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="quiet" onClick={onDismiss}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
