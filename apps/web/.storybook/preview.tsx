import type { Preview } from "@storybook/react-vite";
import "../src/index.css";

const preview: Preview = {
  tags: ["autodocs"],
  initialGlobals: { theme: "light" },
  globalTypes: {
    theme: {
      description: "Cyan-Teal color theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const requested = new URLSearchParams(window.location.search).get("globals") ?? "";
      const fromUrl = requested.split(";").find((item) => item.startsWith("theme:"))?.slice("theme:".length);
      const theme = fromUrl === "dark" || context.globals.theme === "dark" ? "dark" : "light";
      document.documentElement.dataset.storyTheme = theme;
      document.documentElement.dataset.theme = theme;
      document.body.style.background = "var(--color-canvas)";
      document.body.style.color = "var(--color-ink)";
      return (
        <div className="bg-canvas p-4 text-ink">
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    layout: "padded",
  },
};

export default preview;
