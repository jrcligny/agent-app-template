import { ConfirmDialog } from "@/components/overlay/confirm-dialog";

export function ConfirmDelete({
  open,
  count,
  onConfirm,
  onDismiss,
}: {
  open: boolean;
  count: number;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const noun = count === 1 ? "record" : "records";
  return (
    <ConfirmDialog
      open={open}
      title={`Delete ${count} ${noun}?`}
      description="Nothing is deleted until you confirm. If any record in the set cannot be deleted, none of them are deleted."
      confirmLabel={`Delete ${count} ${noun}`}
      onConfirm={onConfirm}
      onDismiss={onDismiss}
    />
  );
}
