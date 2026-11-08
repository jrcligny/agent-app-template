import { useId } from "react";

type Tone = "loading" | "empty" | "error" | "success" | "forbidden";

const tones: Record<Tone, string> = {
  loading: "border-line bg-surface",
  empty: "border-line bg-surface",
  error: "border-danger bg-danger-bg",
  success: "border-ok bg-ok-bg",
  forbidden: "border-danger bg-danger-bg",
};

export function Status({
  tone,
  title,
  detail,
}: {
  tone: Tone;
  title: string;
  detail?: string;
}) {
  const titleId = useId();
  return (
    <div
      role={tone === "error" || tone === "forbidden" ? "alert" : "status"}
      aria-labelledby={titleId}
      className={`rounded-lg border p-4 ${tones[tone]}`}
    >
      <h2 id={titleId} className="text-base font-semibold">
        {title}
      </h2>
      {detail ? <p className="mt-1 text-sm text-muted">{detail}</p> : null}
    </div>
  );
}
