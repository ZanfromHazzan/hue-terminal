import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from 'recharts';
import type { ComparePeriod, DayRow, SeriesKey } from '../types';

interface Props {
  rows: DayRow[];
  priorRows: DayRow[] | null;
  compare: ComparePeriod;
  onCompareChange: (c: ComparePeriod) => void;
}

const SERIES: { key: SeriesKey; label: string; color: string }[] = [
  { key: 'attempts', label: 'Total Attempts', color: '#3b82f6' },
  { key: 'upstream', label: 'Upstream', color: '#94a3b8' },
  { key: 'successful', label: 'Successful', color: '#10b981' },
  { key: 'customerErrors', label: 'Cust. Errors', color: '#f97316' },
  { key: 'systemErrors', label: 'Sys. Errors', color: '#f43f5e' },
];

const DEFAULT_ACTIVE: SeriesKey[] = ['attempts', 'successful', 'systemErrors'];

function formatDate(d: string | number) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function TrendChart({ rows, priorRows, compare, onCompareChange }: Props) {
  const [active, setActive] = useState<Set<SeriesKey>>(new Set(DEFAULT_ACTIVE));
  const anomalyPoints = rows.filter((r) => r.anomaly);

  function toggle(key: SeriesKey) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const chartData = useMemo(() => {
    return rows.map((r, i) => {
      const prior = priorRows?.[i];
      const merged: Record<string, string | number> = { date: r.date };
      for (const s of SERIES) {
        merged[s.key] = r[s.key];
        if (prior) merged[`${s.key}_prior`] = prior[s.key];
      }
      return merged;
    });
  }, [rows, priorRows]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Transaction Trend</h2>
          <p className="text-xs text-gray-400 dark:text-zinc-500">
            {rows.length}-day window — solid = current period, dashed = prior period
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-zinc-800">
            {(['week', 'month'] as const).map((c) => (
              <button
                key={c}
                onClick={() => onCompareChange(c)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  compare === c
                    ? 'bg-gray-900 text-white dark:bg-violet-500/30 dark:text-violet-200'
                    : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {c === 'week' ? 'Week-on-Week' : 'Month-on-Month'}
              </button>
            ))}
          </div>
          {anomalyPoints.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              {anomalyPoints.length} flagged
            </span>
          )}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {SERIES.map((s) => {
          const isActive = active.has(s.key);
          return (
            <button
              key={s.key}
              onClick={() => toggle(s.key)}
              style={
                isActive
                  ? { borderColor: s.color, color: s.color }
                  : undefined
              }
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-white dark:bg-transparent'
                  : 'border-gray-200 bg-gray-100 text-gray-400 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-500'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <defs>
            {SERIES.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#9ca3af"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
            labelFormatter={(d) => formatDate(d as string)}
          />
          {SERIES.filter((s) => active.has(s.key)).map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              fill={`url(#grad-${s.key})`}
              strokeWidth={2}
            />
          ))}
          {priorRows &&
            SERIES.filter((s) => active.has(s.key)).map((s) => (
              <Line
                key={`${s.key}_prior`}
                type="monotone"
                dataKey={`${s.key}_prior`}
                name={`${s.label} (prior)`}
                stroke={s.color}
                strokeDasharray="5 5"
                strokeOpacity={0.5}
                strokeWidth={1.5}
                dot={false}
              />
            ))}
          {anomalyPoints.map((p) => (
            <ReferenceDot
              key={p.date}
              x={p.date}
              y={p.successful}
              r={5}
              fill="#f43f5e"
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
