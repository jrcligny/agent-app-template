import type { Meta, StoryObj } from "@storybook/react-vite";
import { CoverageTable } from "./coverage-table";

const meta = {
  title: "Collections/CoverageTable",
  component: CoverageTable,
  args: {
    phase: "ready",
    report: {
      memberCount: 3,
      target: ["alpha", "beta", "gamma"],
      counts: [
        { category: "alpha", count: 2 },
        { category: "beta", count: 1 },
        { category: "gamma", count: 0 },
      ],
      missing: ["gamma"],
    },
  },
  parameters: { docs: { description: { component: "Requirement COV-1. Missing categories appear only for a declared target." } } },
} satisfies Meta<typeof CoverageTable>;

export default meta;
type Story = StoryObj<typeof meta>;
export const WithGap: Story = {};
export const NoTarget: Story = {
  args: {
    report: {
      memberCount: 3,
      target: null,
      counts: [
        { category: "alpha", count: 2 },
        { category: "beta", count: 1 },
      ],
      missing: [],
    },
  },
};
