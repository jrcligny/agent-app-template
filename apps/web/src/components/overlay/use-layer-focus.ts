import { useEffect, useRef } from "react";

export function useLayerFocus(open: boolean, onDismiss: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  useEffect(() => {
    if (!open) return;
    const node = ref.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    focusable(node)[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable(node);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [open]);

  return ref;
}

function focusable(node: HTMLElement | null): HTMLElement[] {
  if (!node) return [];
  return [
    ...node.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
    ),
  ];
}
