export type Identity = { id: string; fields: Record<string, string>; label: string };

export type DiffRow = {
  id: string;
  kind: "added" | "removed" | "changed";
  fields: string[];
  leftTitle: string | null;
  rightTitle: string | null;
};

const copiedFields = ["title", "status", "category"] as const;

export function diffIdentities(left: Identity[], right: Identity[], fieldNames: readonly string[] = copiedFields): DiffRow[] {
  const leftById = new Map(left.map((item) => [item.id, item]));
  const rightById = new Map(right.map((item) => [item.id, item]));
  const ids = [...new Set([...leftById.keys(), ...rightById.keys()])].sort();
  const rows: DiffRow[] = [];
  for (const id of ids) {
    const before = leftById.get(id);
    const after = rightById.get(id);
    if (before && !after) {
      rows.push({ id, kind: "removed", fields: [], leftTitle: before.label, rightTitle: null });
    } else if (!before && after) {
      rows.push({ id, kind: "added", fields: [], leftTitle: null, rightTitle: after.label });
    } else if (before && after) {
      const fields = fieldNames.filter((field) => before.fields[field] !== after.fields[field]);
      if (fields.length > 0) {
        rows.push({ id, kind: "changed", fields, leftTitle: before.label, rightTitle: after.label });
      }
    }
  }
  return rows;
}

export function provenanceRows(
  left: { environmentName: string | null; configDigest: string | null; codeVersion: string | null },
  right: { environmentName: string | null; configDigest: string | null; codeVersion: string | null },
) {
  const keys = ["environmentName", "configDigest", "codeVersion"] as const;
  return keys.flatMap((field) => {
    const before = blank(left[field]);
    const after = blank(right[field]);
    if (before === null && after === null) return [];
    return [{ field, left: before, right: after }];
  });
}

function blank(value: string | null): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}
