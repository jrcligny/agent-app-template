import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActionRow } from "./action-row";
import { Button } from "./button";

const meta = {
  title: "UI/ActionRow",
  component: ActionRow,
  parameters: { docs: { description: { component: "Requirement ACT-1. Actions sit at the end and use the width of their labels." } } },
} satisfies Meta<typeof ActionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SaveAndCancel: Story = {
  args: {
    label: "Form actions",
    children: (
      <>
        <Button variant="quiet">Cancel</Button>
        <Button>Save record</Button>
      </>
    ),
  },
};
