import { useState } from "react";
import { Status } from "@/components/feedback/status";

export type SectionNode = {
  id: string;
  title: string;
  text: string;
  link?: string | null;
  children: SectionNode[];
};

export function SectionTree({
  phase,
  sections,
}: {
  phase: "loading" | "empty" | "error" | "ready";
  sections: SectionNode[];
}) {
  if (phase === "loading") return <Status tone="loading" title="Loading sections" />;
  if (phase === "error") return <Status tone="error" title="Could not load sections" />;
  if (phase === "empty" || sections.length === 0) {
    return <Status tone="empty" title="No sections" detail="This record has no input, context, or other sections." />;
  }
  return (
    <ul className="grid gap-2">
      {sections.map((section) => (
        <SectionItem key={section.id} section={section} />
      ))}
    </ul>
  );
}

function SectionItem({ section }: { section: SectionNode }) {
  const [open, setOpen] = useState(false);
  const link = safePath(section.link);
  return (
    <li className="rounded-md border border-line bg-surface p-3">
      <button
        type="button"
        className="text-left text-base font-semibold break-words"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((value) => !value);
          }
        }}
      >
        {section.title}
      </button>
      {open ? (
        <div className="mt-2 grid gap-2">
          <p className="whitespace-pre-wrap break-words text-sm">{section.text}</p>
          {link ? (
            <a className="text-sm underline" href={link}>
              {link}
            </a>
          ) : null}
          {section.children.length > 0 ? (
            <ul className="grid gap-2 pl-4">
              {section.children.map((child) => (
                <SectionItem key={child.id} section={child} />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function safePath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes(":") || value.includes("..")) {
    return null;
  }
  return value;
}
