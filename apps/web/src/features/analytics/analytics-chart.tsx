import type { AnalyticsReport } from "@agent-app/contracts";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

export function drillHref(input: {
  from: string;
  to: string;
  status?: string;
  category?: string;
}): string {
  const params = new URLSearchParams();
  if (input.status) params.set("status", input.status);
  if (input.category) params.set("category", input.category);
  params.set("from", input.from);
  params.set("to", input.to);
  return `/records?${params.toString()}`;
}

export function AnalyticsChart({ report }: { report: AnalyticsReport }) {
  const { from, to } = report.window;
  return (
    <div className="grid gap-6">
      <p className="text-sm text-muted">
        Synthetic observations only. These numbers are not measured statistics. The previous window of the same length
        is the only baseline. If that window has no observations, the change is unknown.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Count label="Observations in the window" value={report.totals.count} href={drillHref({ from, to })} />
        <Count label="Sum of observation values" value={report.totals.sum} href={drillHref({ from, to })} />
        <p className="rounded-lg border border-line bg-surface p-4 text-sm">
          Change from the previous window:{" "}
          {report.baseline.deltaCount === null ? "unknown" : report.baseline.deltaCount}
        </p>
      </div>
      {report.totals.count === 0 ? (
        <p className="rounded-lg border border-line bg-surface p-4" role="status">
          No observations in this window. Zero means the defined window is empty. Missing days are not drawn as value
          points.
        </p>
      ) : null}
      <section className="grid gap-3" aria-labelledby="count-series-heading">
        <h2 id="count-series-heading" className="text-lg font-semibold">
          Daily count, {report.window.timeZone}
        </h2>
        <div className="h-56 rounded-lg border border-line bg-surface p-2" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={report.countSeries}>
              <CartesianGrid stroke="var(--color-line)" />
              <XAxis dataKey="day" stroke="var(--color-line)" tick={{ fill: "var(--color-ink)" }} />
              <YAxis allowDecimals={false} stroke="var(--color-line)" tick={{ fill: "var(--color-ink)" }} />
              <Line dataKey="count" name="Count" stroke="var(--color-accent)" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex flex-wrap gap-2">
          {report.countSeries.map((point) => (
            <li key={point.day}>
              <a
                className="inline-flex min-h-11 items-center rounded-md border border-line bg-surface px-3 text-sm"
                href={drillHref({ from, to })}
              >
                {point.day}: {point.count} observations
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className="grid gap-3" aria-labelledby="status-bars-heading">
        <h2 id="status-bars-heading" className="text-lg font-semibold">
          Count by status
        </h2>
        <ul className="grid gap-2">
          {report.statusBars.map((bar) => (
            <li key={bar.status}>
              <a
                className="grid gap-1 rounded-md border border-line bg-surface p-3"
                href={drillHref({ from, to, status: bar.status })}
              >
                <span className="text-sm font-medium">
                  {bar.status} status, {bar.count} observations
                </span>
                <span
                  className={bar.status === "open" ? "h-2 rounded bg-accent" : "h-2 rounded bg-danger"}
                  style={{ width: `${Math.max(8, bar.count * 24)}px` }}
                />
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className="grid gap-2" aria-labelledby="category-bars-heading">
        <h2 id="category-bars-heading" className="text-lg font-semibold">
          Count by category
        </h2>
        <ul className="grid gap-2">
          {report.categoryBars.map((bar) => (
            <li key={bar.category}>
              <a className="block rounded-md border border-line bg-surface p-3 text-sm" href={drillHref({ from, to, category: bar.category })}>
                Category {bar.category}, {bar.count} observations
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className="overflow-x-auto" aria-labelledby="analytics-table-heading">
        <h2 id="analytics-table-heading" className="text-lg font-semibold">
          Same numbers as text
        </h2>
        <table className="mt-2 w-full border-collapse text-left text-sm">
          <caption className="sr-only">Observation totals and daily counts</caption>
          <thead>
            <tr className="border-b border-line">
              <th className="p-2" scope="col">
                Bucket
              </th>
              <th className="p-2" scope="col">
                Count
              </th>
              <th className="p-2" scope="col">
                Value sum
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <th className="p-2" scope="row">
                Window total
              </th>
              <td className="p-2">{report.totals.count}</td>
              <td className="p-2">{report.totals.sum}</td>
            </tr>
            {report.countSeries.map((point) => (
              <tr key={point.day} className="border-b border-line">
                <th className="p-2" scope="row">
                  {point.day}
                </th>
                <td className="p-2">{point.count}</td>
                <td className="p-2">{report.valueSeries.find((item) => item.day === point.day)?.sum ?? "omitted"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Count({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <a href={href} className="rounded-lg border border-line bg-surface p-4">
      <span className="block text-sm text-muted">{label}</span>
      <span className="mt-1 block text-3xl font-semibold">{value}</span>
    </a>
  );
}
