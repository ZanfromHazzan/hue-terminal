import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
} from 'recharts';
import type { ComparePeriod, DayRow } from '../types';

type Granularity = 'day' | 'week' | 'month';
type ChartType = 'bar' | 'line';

interface Props {
  rows: DayRow[];
  priorRows: DayRow[] | null;
  comparePeriod: ComparePeriod;
  onComparePeriodChange: (p: ComparePeriod) => void;
}

interface Bucket {
  label: string;
  successful: number;
  customerErrors: number;
  systemErrors: number;
  localOnly: number;
  attempts: number;
}

const SEGMENTS: { key: keyof Omit<Bucket, 'label' | 'attempts'>; label: string; color: string }[] = [
  { key: 'successful', label: 'Successful', color: '#10b981' },
  { key: 'customerErrors', label: 'Customer error', color: '#f97316' },
  { key: 'systemErrors', label: 'System error', color: '#f43f5e' },
  { key: 'localOnly', label: 'Local-only', color: '#a78bfa' },
];

function emptyBucket(): Omit<Bucket, 'label'> {
  return { successful: 0, customerErrors: 0, systemErrors: 0, localOnly: 0, attempts: 0 };
}

function addRow(acc: Omit<Bucket, 'label'>, r: DayRow) {
  acc.successful += r.successful;
  acc.customerErrors += r.customerErrors;
  acc.systemErrors += r.systemErrors;
  acc.localOnly += r.localOnly;
  acc.attempts += r.attempts;
}

function bucketRows(rows: DayRow[], granularity: Granularity): Bucket[] {
  if (granularity === 'day') {
    return rows.map((r) => ({
      label: r.date,
      successful: r.successful,
      customerErrors: r.customerErrors,
      systemErrors: r.systemErrors,
      localOnly: r.localOnly,
      attempts: r.attempts,
    }));
  }

  if (granularity === 'month') {
    const map = new Map<string, Omit<Bucket, 'label'>>();
    for (const r of rows) {
      const key = r.date.slice(0, 7);
      const acc = map.get(key) ?? emptyBucket();
      addRow(acc, r);
      map.set(key, acc);
    }
    return Array.from(map.entries()).map(([label, v]) => ({ label, ...v }));
  }

  // week: fixed 7-row chunks, anchored to the end so the most recent week is complete
  const chunks: DayRow[][] = [];
  for (let i = rows.length; i > 0; i -= 7) {
    chunks.unshift(rows.slice(Math.max(0, i - 7), i));
  }
  return chunks.map((chunk) => {
    const acc = emptyBucket();
    chunk.forEach((r) => addRow(acc, r));
    return { label: `${chunk[0].date} → ${chunk[chunk.length - 1].date}`, ...acc };
  });
}

function formatDayLabel(label: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    return new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  return label;
}

export function TrendChart({ rows, priorRows, comparePeriod, onComparePeriodChange }: Props) {
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [chartType, setChartType] = useState<ChartType>('bar');

  const anomalyPoints = granularity === 'day' ? rows.filter((r) => r.anomaly) : [];

  const chartData = useMemo(() => {
    const current = bucketRows(rows, granularity);
    const prior = priorRows ? bucketRows(priorRows, granularity) : null;
    return current.map((bucket, i) => ({
      ...bucket,
      attemptsPrior: prior?.[i]?.attempts,
    }));
  }, [rows, priorRows, granularity]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Transaction Trend</h2>
          {anomalyPoints.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              {anomalyPoints.length} anomaly flagged
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-zinc-800">
            {(['bar', 'line'] as ChartType[]).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  chartType === t
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-violet-500/20 dark:text-violet-200 dark:shadow-none'
                    : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-zinc-800">
            {(['day', 'week', 'month'] as Granularity[]).map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  granularity === g
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-violet-500/20 dark:text-violet-200 dark:shadow-none'
                    : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-zinc-800">
            {(['none', 'week', 'month'] as ComparePeriod[]).map((c) => (
              <button
                key={c}
                onClick={() => onComparePeriodChange(c)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  comparePeriod === c
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-violet-500/20 dark:text-violet-200 dark:shadow-none'
                    : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {c === 'none' ? 'No compare' : c === 'week' ? 'vs. prior week' : 'vs. prior month'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tickFormatter={formatDayLabel}
            stroke="#9ca3af"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            angle={granularity === 'week' ? -20 : 0}
            textAnchor={granularity === 'week' ? 'end' : 'middle'}
            height={granularity === 'week' ? 50 : 30}
          />
          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
            labelFormatter={(l) => formatDayLabel(l as string)}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {chartType === 'bar'
            ? SEGMENTS.map((s) => <Bar key={s.key} dataKey={s.key} name={s.label} stackId="outcome" fill={s.color} />)
            : SEGMENTS.map((s) => (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} />
              ))}
          {priorRows && (
            <Line
              type="monotone"
              dataKey="attemptsPrior"
              name="Attempts (prior period)"
              stroke="#64748b"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              dot={false}
            />
          )}
          {anomalyPoints.map((p) => (
            <ReferenceDot key={p.date} x={p.date} y={p.successful} r={5} fill="#f43f5e" stroke="#fff" strokeWidth={2} />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
