import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConfirmDialog } from "./confirm-dialog";

const meta = {
  title: "Overlay/ConfirmDialog",
  component: ConfirmDialog,
  args: {
    open: true,
    title: "Remove 2 samples?",
    description: "This sample dialog does not call an API.",
    confirmLabel: "Remove 2 samples",
    onConfirm: () => undefined,
    onDismiss: () => undefined,
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};
