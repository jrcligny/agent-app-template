import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./card";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: { docs: { description: { component: "Requirement UI-5. A card groups text and is not itself a button." } } },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Note: Story = {
  args: { children: <><h3 className="font-semibold">Weekly summary</h3><p className="text-sm text-muted">Synthetic note text.</p></> },
};
