import { sql } from "drizzle-orm";
import { requireRecordView } from "../access/record-access.js";
import type { Db } from "../db/types.js";
import { observation, record } from "../db/schema.js";

export const allowedTimeZones = ["UTC", "Europe/Paris"] as const;
export type AnalyticsTimeZone = (typeof allowedTimeZones)[number];

export class AnalyticsWindowError extends Error {
  constructor() {
    super("The window start must be before the end");
    this.name = "AnalyticsWindowError";
  }
}

const alphaFixture = [
  { key: "alpha-1", at: "2026-01-15T10:00:00.000Z", category: "alpha", status: "open" as const, value: 2, title: "Fixture alpha open early" },
  { key: "alpha-2", at: "2026-01-15T11:00:00.000Z", category: "alpha", status: "open" as const, value: 3, title: "Fixture alpha open later" },
  { key: "alpha-3", at: "2026-01-15T23:30:00.000Z", category: "beta", status: "closed" as const, value: 5, title: "Fixture alpha closed" },
];

export type AnalyticsQuery = {
  from: Date;
  to: Date;
  timeZone: AnalyticsTimeZone;
  category?: string;
  status?: "open" | "closed";
};

export type AnalyticsReport = {
  window: { from: string; to: string; timeZone: AnalyticsTimeZone };
  totals: { count: number; sum: number; openCount: number; closedCount: number };
  baseline: { from: string; to: string; observations: number; deltaCount: number | null; deltaSum: number | null };
  countSeries: { day: string; count: number }[];
  valueSeries: { day: string; sum: number }[];
  statusBars: { status: "open" | "closed"; count: number }[];
  categoryBars: { category: string; count: number }[];
  synthetic: true;
  fixture: "alpha" | null;
};

export function assertOrderedWindow(from: Date, to: Date): void {
  if (!(from.getTime() < to.getTime())) throw new AnalyticsWindowError();
}

export function previousWindow(from: Date, to: Date): { from: Date; to: Date } {
  const duration = to.getTime() - from.getTime();
  return { from: new Date(from.getTime() - duration), to: from };
}

export async function seedAlphaFixture(db: Db, userId: string): Promise<void> {
  await requireRecordView(db, userId);
  await db.transaction(async (tx) => {
    for (const item of alphaFixture) {
      const existing = await tx.execute(sql`
        select id from observation where user_id = ${userId} and fixture_key = ${item.key} limit 1
      `);
      if (rowsOf(existing).length > 0) continue;
      const inserted = await tx
        .insert(record)
        .values({
          userId,
          title: item.title,
          status: item.status,
          summary: "Labeled synthetic fixture alpha. Not a measured statistic.",
          body: "Demo observation linked to this record.",
          reason: item.status === "closed" ? "Fixture closed state" : null,
          createdAt: new Date(item.at),
          updatedAt: new Date(item.at),
        })
        .returning({ id: record.id });
      const recordId = inserted[0]?.id;
      if (!recordId) throw new Error("Fixture record was not created");
      await tx.insert(observation).values({
        userId,
        recordId,
        fixtureKey: item.key,
        category: item.category,
        status: item.status,
        value: item.value,
        observedAt: new Date(item.at),
      });
    }
  });
}

export async function reportAnalytics(db: Db, userId: string, query: AnalyticsQuery): Promise<AnalyticsReport> {
  await requireRecordView(db, userId);
  assertOrderedWindow(query.from, query.to);
  const totals = await totalsFor(db, userId, query.from, query.to, query);
  const previous = previousWindow(query.from, query.to);
  const previousTotals = await totalsFor(db, userId, previous.from, previous.to, query);
  const series = await seriesFor(db, userId, query);
  const statusBars = await statusBarsFor(db, userId, query);
  const categoryBars = await categoryBarsFor(db, userId, query);
  const deltaKnown = previousTotals.count > 0;
  return {
    window: { from: query.from.toISOString(), to: query.to.toISOString(), timeZone: query.timeZone },
    totals,
    baseline: {
      from: previous.from.toISOString(),
      to: previous.to.toISOString(),
      observations: previousTotals.count,
      deltaCount: deltaKnown ? totals.count - previousTotals.count : null,
      deltaSum: deltaKnown ? totals.sum - previousTotals.sum : null,
    },
    countSeries: series.map((point) => ({ day: point.day, count: point.count })),
    valueSeries: series.filter((point) => point.sum !== null).map((point) => ({ day: point.day, sum: point.sum ?? 0 })),
    statusBars,
    categoryBars,
    synthetic: true,
    fixture: null,
  };
}

async function totalsFor(db: Db, userId: string, from: Date, to: Date, query: AnalyticsQuery) {
  const result = await db.execute(sql`
    select count(*)::int as count,
           coalesce(sum(value), 0)::int as sum,
           count(*) filter (where status = 'open')::int as open_count,
           count(*) filter (where status = 'closed')::int as closed_count
    from observation
    where user_id = ${userId}
      and observed_at >= ${from}
      and observed_at < ${to}
      and (${query.category ?? null}::text is null or category = ${query.category ?? null})
      and (${query.status ?? null}::text is null or status = ${query.status ?? null})
  `);
  const row = rowsOf(result)[0] ?? {};
  return {
    count: numberField(row, "count"),
    sum: numberField(row, "sum"),
    openCount: numberField(row, "open_count"),
    closedCount: numberField(row, "closed_count"),
  };
}

async function seriesFor(db: Db, userId: string, query: AnalyticsQuery) {
  const result = await db.execute(sql`
    with days as (
      select generate_series(
        date_trunc('day', ${query.from}::timestamptz at time zone ${query.timeZone}),
        date_trunc('day', (${query.to}::timestamptz - interval '1 millisecond') at time zone ${query.timeZone}),
        interval '1 day'
      )::date as day
    ),
    grouped as (
      select date_trunc('day', observed_at at time zone ${query.timeZone})::date as day,
             count(*)::int as count,
             coalesce(sum(value), 0)::int as sum
      from observation
      where user_id = ${userId}
        and observed_at >= ${query.from}
        and observed_at < ${query.to}
        and (${query.category ?? null}::text is null or category = ${query.category ?? null})
        and (${query.status ?? null}::text is null or status = ${query.status ?? null})
      group by 1
    )
    select to_char(days.day, 'YYYY-MM-DD') as day,
           coalesce(grouped.count, 0)::int as count,
           grouped.sum::int as sum
    from days
    left join grouped on grouped.day = days.day
    order by days.day
  `);
  return rowsOf(result).map((row) => ({
    day: String(row.day),
    count: numberField(row, "count"),
    sum: row.sum === null || row.sum === undefined ? null : numberField(row, "sum"),
  }));
}

async function statusBarsFor(db: Db, userId: string, query: AnalyticsQuery) {
  const result = await db.execute(sql`
    select status, count(*)::int as count
    from observation
    where user_id = ${userId}
      and observed_at >= ${query.from}
      and observed_at < ${query.to}
      and (${query.category ?? null}::text is null or category = ${query.category ?? null})
    group by status
  `);
  const counts = new Map(rowsOf(result).map((row) => [String(row.status), numberField(row, "count")]));
  return [
    { status: "open" as const, count: counts.get("open") ?? 0 },
    { status: "closed" as const, count: counts.get("closed") ?? 0 },
  ];
}

async function categoryBarsFor(db: Db, userId: string, query: AnalyticsQuery) {
  const result = await db.execute(sql`
    select category, count(*)::int as count
    from observation
    where user_id = ${userId}
      and observed_at >= ${query.from}
      and observed_at < ${query.to}
      and (${query.status ?? null}::text is null or status = ${query.status ?? null})
    group by category
    order by category
  `);
  return rowsOf(result).map((row) => ({ category: String(row.category), count: numberField(row, "count") }));
}

function rowsOf(result: unknown): Record<string, unknown>[] {
  if (Array.isArray(result)) return result as Record<string, unknown>[];
  if (result && typeof result === "object" && "rows" in result) {
    return (result as { rows: Record<string, unknown>[] }).rows;
  }
  return [];
}

function numberField(row: Record<string, unknown>, key: string): number {
  return Number(row[key] ?? 0);
}
