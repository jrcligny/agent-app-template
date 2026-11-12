import { expect, it } from "vitest";
import { readThemeChoice, resolveTheme } from "./theme";

it("uses the system theme until a person stores light or dark", () => {
  expect(resolveTheme("system", true)).toBe("dark");
  expect(resolveTheme("system", false)).toBe("light");
  expect(resolveTheme("light", true)).toBe("light");
  expect(resolveTheme("dark", false)).toBe("dark");
  expect(readThemeChoice({ getItem: () => "dark" })).toBe("dark");
  expect(readThemeChoice({ getItem: () => "nope" })).toBe("system");
  expect(readThemeChoice(null)).toBe("system");
});
