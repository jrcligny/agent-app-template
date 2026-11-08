import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConfirmDialog } from "./confirm-dialog";

const meta = {
  title: "Overlay/ConfirmDialog",
  component: ConfirmDialog,
  args: {
    open: true,
    title: "Delete 2 records?",
    description: "If any record in the set cannot be deleted, none of them are deleted.",
    confirmLabel: "Delete 2 records",
    onConfirm: () => undefined,
    onDismiss: () => undefined,
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};
