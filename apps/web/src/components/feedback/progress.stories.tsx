import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressMeter } from "./progress";

const meta = {
  title: "Feedback/Progress",
  component: ProgressMeter,
  args: { value: 40, label: "Export progress" },
} satisfies Meta<typeof ProgressMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Running: Story = {};
export const Finished: Story = { args: { value: 100, label: "Export progress" } };
