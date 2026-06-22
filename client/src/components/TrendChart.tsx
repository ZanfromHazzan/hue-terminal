import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
} from 'recharts';
import type { DayRow, ErrorFilter } from '../types';

interface Props {
  rows: DayRow[];
  errorFilter: ErrorFilter;
}

const SERIES: Record<ErrorFilter, { key: keyof DayRow; label: string; color: string }> = {
  all: { key: 'attempts', label: 'Attempts', color: '#71717a' },
  customer: { key: 'customerErrors', label: 'Customer Errors', color: '#fb923c' },
  system: { key: 'systemErrors', label: 'System Errors', color: '#f43f5e' },
  local: { key: 'localOnly', label: 'Local-only', color: '#a1a1aa' },
};

function formatDate(d: string | number) {
  const date = new Date(d);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function TrendChart({ rows, errorFilter }: Props) {
  const errorSeries = SERIES[errorFilter];
  const anomalyPoints = rows.filter((r) => r.anomaly);

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Transaction Trend</h2>
        {anomalyPoints.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            {anomalyPoints.length} anomal{anomalyPoints.length === 1 ? 'y' : 'ies'} flagged
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={rows} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="errorGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={errorSeries.color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={errorSeries.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#52525b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8 }}
            labelStyle={{ color: '#e4e4e7' }}
            labelFormatter={(d) => formatDate(d as string)}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
          <Area
            type="monotone"
            dataKey="successful"
            name="Successful"
            stroke="#34d399"
            fill="url(#successGrad)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey={errorSeries.key}
            name={errorSeries.label}
            stroke={errorSeries.color}
            fill="url(#errorGrad)"
            strokeWidth={2}
          />
          {anomalyPoints.map((p) => (
            <ReferenceDot
              key={p.date}
              x={p.date}
              y={p.successful}
              r={5}
              fill="#f43f5e"
              stroke="#18181b"
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
