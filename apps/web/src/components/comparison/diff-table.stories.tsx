import type { Meta, StoryObj } from "@storybook/react-vite";
import { DiffTable } from "./diff-table";

const meta = {
  title: "Collections/DiffTable",
  component: DiffTable,
  args: {
    phase: "ready" as const,
    rows: [
      { id: "a", kind: "removed" as const, fields: [], leftTitle: "Alpha title", rightTitle: null },
      { id: "b", kind: "changed" as const, fields: ["title"], leftTitle: "Beta title", rightTitle: "Beta renamed" },
      { id: "c", kind: "added" as const, fields: [], leftTitle: null, rightTitle: "Gamma title" },
    ],
    provenance: [{ field: "codeVersion" as const, left: null, right: "2026.11.10" }],
  },
  parameters: {
    docs: { description: { component: "Requirements DIFF-1 and DIFF-2. See openspec/specs/structured-diff/spec.md after archive." } },
  },
} satisfies Meta<typeof DiffTable>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Membership: Story = {};
export const NoDifferences: Story = { args: { phase: "empty", rows: [], provenance: [] } };
