export type ThemeChoice = "system" | "light" | "dark";

export const themeStorageKey = "workbench-theme";

export function readThemeChoice(storage: Pick<Storage, "getItem"> | null): ThemeChoice {
  try {
    const value = storage?.getItem(themeStorageKey);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(choice: ThemeChoice, systemDark: boolean): "light" | "dark" {
  if (choice === "light" || choice === "dark") return choice;
  return systemDark ? "dark" : "light";
}

export function applyTheme(
  choice: ThemeChoice,
  systemDark: boolean,
  storage: Pick<Storage, "setItem"> | null = globalThis.localStorage,
): "light" | "dark" {
  const theme = resolveTheme(choice, systemDark);
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themeChoice = choice;
  try {
    storage?.setItem(themeStorageKey, choice);
  } catch {
    // Private mode can reject storage. The current document still shows the choice.
  }
  return theme;
}
