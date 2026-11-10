import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { HierarchyPath, type HierarchyView } from "./hierarchy-path";

const collectionId = "11111111-1111-4111-8111-111111111111";
const snapshotId = "22222222-2222-4222-8222-222222222222";
const itemId = "33333333-3333-4333-8333-333333333333";

const base: HierarchyView = {
  collection: { id: collectionId, name: "Release" },
  snapshots: [{ id: snapshotId, name: "Baseline", revision: 1 }],
  snapshot: { id: snapshotId, name: "Baseline", revision: 1 },
  items: [{ id: itemId, title: "Alpha title", status: "open", category: "alpha" }],
  item: {
    id: itemId,
    title: "Alpha title",
    status: "open",
    category: "alpha",
    attempts: [{ id: "44444444-4444-4444-8444-444444444444", label: "First check", attemptedAt: "2026-01-15T23:30:00.000Z" }],
  },
  attempt: { id: "44444444-4444-4444-8444-444444444444", label: "First check", attemptedAt: "2026-01-15T23:30:00.000Z" },
  status: "open",
};

const meta = {
  title: "Collections/HierarchyPath",
  component: HierarchyPath,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    phase: "ready",
    path: base,
    refreshing: false,
    status: "open",
    labelError: null,
    focusToken: 0,
    onStatus: () => undefined,
    onBack: () => undefined,
    onSaveAttempt: async () => false,
  },
  parameters: {
    docs: { description: { component: "Requirements NAV-1, NAV-2, and NAV-3. See openspec/specs/hierarchy-navigation/spec.md." } },
  },
} satisfies Meta<typeof HierarchyPath>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Attempt: Story = {};
export const NoAttempts: Story = {
  args: {
    path: {
      ...base,
      item: base.item ? { ...base.item, attempts: [] } : null,
      attempt: null,
    },
  },
};
