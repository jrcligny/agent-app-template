import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component: "Requirements UI-1 and ACT-1 Buttons stay content width. See openspec/specs/action-controls/spec.md.",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { children: "Save", variant: "primary" } };
export const Quiet: Story = { args: { children: "Sign out", variant: "quiet" } };
export const Danger: Story = { args: { children: "Remove sample", variant: "danger" } };
