import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function WizardFrame({
  step,
  total,
  title,
  children,
  onBack,
  onNext,
  nextLabel,
}: {
  step: number;
  total: number;
  title: string;
  children: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <section className="grid gap-6" aria-labelledby="wizard-heading">
      <div className="grid gap-2">
        <p className="text-sm text-muted">
          Step {step} of {total}
        </p>
        <h1 id="wizard-heading" className="text-2xl font-semibold">
          {title}
        </h1>
      </div>
      {children}
      <div className="flex flex-wrap gap-3">
        {onBack ? (
          <Button variant="quiet" onClick={onBack}>
            Back
          </Button>
        ) : null}
        <Button onClick={onNext}>{nextLabel}</Button>
      </div>
    </section>
  );
}
