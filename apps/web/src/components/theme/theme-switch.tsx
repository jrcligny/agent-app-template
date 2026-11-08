import { useEffect, useState } from "react";
import { applyTheme, readThemeChoice, type ThemeChoice } from "@/theme/theme";

export function ThemeSwitch() {
  const [choice, setChoice] = useState<ThemeChoice>("system");

  useEffect(() => {
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

  return (
    <label className="grid gap-1 text-sm" htmlFor="color-theme">
      Color theme
      <select
        id="color-theme"
        className="min-h-11 rounded-md border border-line bg-surface px-3 text-ink"
        value={choice}
        onChange={(event) => {
          const next = event.target.value === "light" || event.target.value === "dark" ? event.target.value : "system";
          setChoice(next);
          applyTheme(next, Boolean(window.matchMedia?.("(prefers-color-scheme: dark)").matches));
        }}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
