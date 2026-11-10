import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component: "Requirement UI-1 and ACT-1. See openspec/specs/action-controls/spec.md and the pending shared-controls spec.",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { children: "Add note", variant: "primary" } };
export const Quiet: Story = { args: { children: "Sign out", variant: "quiet" } };
export const Danger: Story = { args: { children: "Delete note", variant: "danger" } };
