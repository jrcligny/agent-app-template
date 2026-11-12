import type { Meta, StoryObj } from "@storybook/react-vite";
import { WizardFrame } from "./wizard-frame";

const meta = {
  title: "Wizard/WizardFrame",
  component: WizardFrame,
  args: {
    step: 2,
    total: 3,
    title: "Status",
    nextLabel: "Next",
    onNext: () => undefined,
    onBack: () => undefined,
    children: "Choose a status before continuing.",
  },
} satisfies Meta<typeof WizardFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MiddleStep: Story = {};
