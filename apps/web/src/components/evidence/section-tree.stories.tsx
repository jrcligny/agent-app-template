import type { Meta, StoryObj } from "@storybook/react-vite";
import { SectionTree } from "./section-tree";

const meta = {
  title: "Evidence/SectionTree",
  component: SectionTree,
  args: {
    phase: "ready",
    sections: [
      {
        id: "context",
        title: "Context",
        text: "Visible field text, not HTML.",
        link: "/records",
        children: [{ id: "field", title: "Nested field", text: "A child value", link: null, children: [] }],
      },
    ],
  },
  parameters: { docs: { description: { component: "Requirement SEC-1. Text is shown as text." } } },
} satisfies Meta<typeof SectionTree>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Nested: Story = {};
export const Empty: Story = { args: { phase: "empty", sections: [] } };
