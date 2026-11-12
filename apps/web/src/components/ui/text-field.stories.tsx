import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextField } from "./text-field";

const meta = {
  title: "UI/TextField",
  component: TextField,
  args: { id: "title", label: "Title" },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Error: Story = { args: { error: "Enter a title.", defaultValue: "" } };
