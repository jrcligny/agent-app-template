export function ProgressMeter({ value, label }: { value: number; label: string }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="grid gap-2">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safe}
        className="h-3 overflow-hidden rounded-full border border-line bg-surface"
      >
        <div className="h-full bg-accent" style={{ width: `${safe}%` }} />
      </div>
      <p className="text-sm text-muted">{label}: {safe}%</p>
    </div>
  );
}
