import type { Meta, StoryObj } from "@storybook/react-vite";
import { Status } from "./status";

const meta = {
  title: "Feedback/Status",
  component: Status,
  args: { title: "No notes yet", detail: "Notes you add stay on your account." },
} satisfies Meta<typeof Status>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = { args: { tone: "loading", title: "Loading notes", detail: undefined } };
export const Empty: Story = { args: { tone: "empty" } };
export const Error: Story = { args: { tone: "error", title: "Could not load notes", detail: undefined } };
export const Success: Story = { args: { tone: "success", title: "Note added", detail: undefined } };
export const Forbidden: Story = {
  args: { tone: "forbidden", title: "You do not have permission to view records", detail: undefined },
};
