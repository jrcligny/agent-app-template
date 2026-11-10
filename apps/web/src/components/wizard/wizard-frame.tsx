import type { ReactNode } from "react";
import { ActionRow } from "@/components/ui/action-row";
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
  const stepText = `Step ${step} of ${total}. Current step: ${title}.`;
  const progress = total > 0 ? Math.round((step / total) * 100) : 0;
  return (
    <section className="grid gap-6" aria-labelledby="wizard-heading">
      <nav aria-label="Breadcrumb" className="text-sm">
        <a href="/records">Records</a>
        <span aria-hidden="true"> / </span>
        <span>New record</span>
      </nav>
      <div className="grid gap-2">
        <p id="wizard-progress-label" className="text-sm text-muted">
          {stepText}
        </p>
        <div
          role="progressbar"
          aria-labelledby="wizard-progress-label"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={step}
          aria-valuetext={stepText}
          className="h-3 overflow-hidden rounded-full border border-line bg-surface"
        >
          <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
        </div>
        <h1 id="wizard-heading" className="text-2xl font-semibold">
          {title}
        </h1>
      </div>
      {children}
      <ActionRow label="Wizard actions">
        {onBack ? (
          <Button variant="quiet" onClick={onBack}>
            Back
          </Button>
        ) : null}
        <Button onClick={onNext}>{nextLabel}</Button>
      </ActionRow>
    </section>
  );
}
