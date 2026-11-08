import type { Meta, StoryObj } from "@storybook/react-vite";
import { Drawer } from "./drawer";

const meta = {
  title: "Overlay/Drawer",
  component: Drawer,
  args: {
    open: true,
    title: "Alpha",
    onClose: () => undefined,
    children: "Short summary of the record.",
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};
