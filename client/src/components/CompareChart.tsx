import { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { DayRow, SeriesKey } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#a78bfa', '#f43f5e', '#0ea5e9'];

const SERIES_OPTIONS: { key: SeriesKey; label: string }[] = [
  { key: 'attempts', label: 'Attempts' },
  { key: 'upstream', label: 'Upstream' },
  { key: 'successful', label: 'Successful' },
  { key: 'customerErrors', label: 'Customer Errors' },
  { key: 'systemErrors', label: 'System Errors' },
  { key: 'localOnly', label: 'Local-Only' },
];

function formatDate(d: string | number) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface Entity {
  label: string;
  rows: DayRow[];
}

export function CompareChart({ entities }: { entities: Entity[] }) {
  const [metric, setMetric] = useState<SeriesKey>('successful');

  const chartData = useMemo(() => {
    const dates = entities[0]?.rows.map((r) => r.date) ?? [];
    return dates.map((date, i) => {
      const point: Record<string, string | number> = { date };
      entities.forEach((e) => {
        point[e.label] = e.rows[i]?.[metric] ?? 0;
      });
      return point;
    });
  }, [entities, metric]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Trend Comparison</h2>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as SeriesKey)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200"
        >
          {SERIES_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatDate} stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
            labelFormatter={(d) => formatDate(d as string)}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {entities.map((e, i) => (
            <Line
              key={e.label}
              type="monotone"
              dataKey={e.label}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
