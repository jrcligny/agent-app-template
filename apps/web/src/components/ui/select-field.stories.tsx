import type { Meta, StoryObj } from "@storybook/react-vite";
import { SelectField } from "./select-field";

const meta = {
  title: "UI/SelectField",
  component: SelectField,
  args: {
    id: "status",
    label: "Status",
    defaultValue: "open",
    children: (
      <>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </>
    ),
  },
  parameters: {
    docs: { description: { component: "Requirement UI-2. See the pending shared-controls spec." } },
  },
} satisfies Meta<typeof SelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Status: Story = {};
export const Invalid: Story = { args: { error: "Choose a status." } };
