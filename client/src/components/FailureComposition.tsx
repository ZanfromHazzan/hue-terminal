import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DayRow } from '../types';

function sumBy(rows: DayRow[], key: keyof DayRow): number {
  return rows.reduce((acc, r) => acc + (r[key] as number), 0);
}

function MiniKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-white/5 dark:bg-zinc-900/40">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

export function FailureComposition({ rows }: { rows: DayRow[] }) {
  if (rows.length === 0) return null;

  const attempts = sumBy(rows, 'attempts');
  const upstream = sumBy(rows, 'upstream');
  const successful = sumBy(rows, 'successful');
  const customerErrors = sumBy(rows, 'customerErrors');
  const systemErrors = sumBy(rows, 'systemErrors');
  const localOnly = sumBy(rows, 'localOnly');

  const donutData = [
    { name: 'Customer error', value: customerErrors, color: '#f97316' },
    { name: 'System error', value: systemErrors, color: '#f43f5e' },
  ];
  const failedUpstream = customerErrors + systemErrors;

  const pct = (n: number, d: number) => (d > 0 ? ((n / d) * 100).toFixed(1) : '0.0');

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Failure Composition</h2>
      <p className="mb-3 text-xs text-gray-400 dark:text-zinc-500">Customer vs. system error, upstream failures only</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-center">
          {failedUpstream > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  {donutData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => {
                    const n = Number(value ?? 0);
                    return [`${n.toLocaleString()} (${pct(n, failedUpstream)}%)`, name];
                  }}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="w-full py-10 text-center text-sm text-gray-400 dark:text-zinc-500">No upstream failures in this window</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 self-center">
          <MiniKpi label="Success rate" value={`${pct(successful, upstream)}%`} />
          <MiniKpi label="Customer-error rate" value={`${pct(customerErrors, upstream)}%`} />
          <MiniKpi label="System-error rate" value={`${pct(systemErrors, upstream)}%`} />
          <MiniKpi label="Local-only rate" value={`${pct(localOnly, attempts)}%`} />
        </div>
      </div>
    </div>
  );
}
