import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeSwitch } from "./theme-switch";

const meta = {
  title: "Theme/ThemeSwitch",
  component: ThemeSwitch,
  parameters: {
    docs: {
      description: {
        component: "Requirements THEME-1 and THEME-4. See openspec/specs/color-theme/spec.md and the pending color-theme delta.",
      },
    },
  },
} satisfies Meta<typeof ThemeSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HeaderControl: Story = {
  render: () => (
    <div className="flex justify-end rounded-md border border-line bg-surface p-3">
      <ThemeSwitch />
    </div>
  ),
};
