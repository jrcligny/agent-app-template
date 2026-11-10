import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { applyTheme, readThemeChoice, type ThemeChoice } from "@/theme/theme";

const choices: ThemeChoice[] = ["light", "dark", "system"];

const labels: Record<ThemeChoice, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export function ThemeSwitch() {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const tipId = useId();

  useEffect(() => {
    const storyTheme = document.documentElement.dataset.storyTheme;
    if (storyTheme === "light" || storyTheme === "dark") {
      document.documentElement.dataset.theme = storyTheme;
      setChoice(storyTheme);
      return;
    }
    const stored = readThemeChoice(window.localStorage);
    setChoice(stored);
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const paint = (next: ThemeChoice) => applyTheme(next, Boolean(media?.matches));
    paint(stored);
    const onChange = () => {
      if (readThemeChoice(window.localStorage) === "system") paint("system");
    };
    media?.addEventListener("change", onChange);
    return () => media?.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const selected = menuRef.current?.querySelector<HTMLButtonElement>("[aria-checked='true']");
    selected?.focus();
    function onPointer(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  function choose(next: ThemeChoice) {
    setChoice(next);
    applyTheme(next, Boolean(window.matchMedia?.("(prefers-color-scheme: dark)").matches));
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onMenuKey(event: KeyboardEvent<HTMLDivElement>) {
    const current = choices.indexOf(choice);
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const next =
        event.key === "Home" ? 0 : event.key === "End" ? choices.length - 1 : event.key === "ArrowDown" ? (current + 1) % choices.length : (current - 1 + choices.length) % choices.length;
      const value = choices[next] ?? "system";
      setChoice(value);
      applyTheme(value, Boolean(window.matchMedia?.("(prefers-color-scheme: dark)").matches));
      queueMicrotask(() => menuRef.current?.querySelector<HTMLButtonElement>(`[data-choice='${value}']`)?.focus());
    }
  }

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-md border-2 border-focus bg-surface text-ink"
        aria-label={`Color theme, ${labels[choice]}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-describedby={tipId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <ThemeIcon choice={choice} />
      </button>
      <span id={tipId} role="tooltip" className="sr-only">
        Color theme
      </span>
      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Color theme"
          className="absolute right-0 z-30 mt-1 w-44 rounded-md border border-line bg-surface p-1"
          onKeyDown={onMenuKey}
        >
          {choices.map((item) => (
            <button
              key={item}
              type="button"
              role="menuitemradio"
              data-choice={item}
              aria-checked={choice === item}
              className="flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-ink hover:bg-canvas"
              onClick={() => choose(item)}
            >
              <ThemeIcon choice={item} />
              <span className="flex-1">{labels[item]}</span>
              {choice === item ? <span aria-hidden="true">✓</span> : <span aria-hidden="true" className="w-3" />}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ThemeIcon({ choice }: { choice: ThemeChoice }) {
  const common = "h-5 w-5";
  if (choice === "dark") {
    return (
      <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M14.5 3.2a8.5 8.5 0 1 0 6.3 12.6A7 7 0 0 1 14.5 3.2z" />
      </svg>
    );
  }
  if (choice === "system") {
    return (
      <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M8 20h8M12 16v4" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19"
      />
    </svg>
  );
}
