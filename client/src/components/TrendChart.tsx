import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceDot } from 'recharts';
import type { DayRow, ErrorFilter } from '../types';

interface Props {
  rows: DayRow[];
  errorFilter: ErrorFilter;
}

const ERROR_SERIES: Record<Exclude<ErrorFilter, 'all'>, { key: keyof DayRow; label: string; color: string }> = {
  customer: { key: 'customerErrors', label: 'Customer Errors', color: '#f97316' },
  system: { key: 'systemErrors', label: 'System Errors', color: '#f43f5e' },
  local: { key: 'localOnly', label: 'Local-Only', color: '#a78bfa' },
};

function formatDate(d: string | number) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function TrendChart({ rows, errorFilter }: Props) {
  const anomalyPoints = rows.filter((r) => r.anomaly);
  const errorSeries = errorFilter !== 'all' ? ERROR_SERIES[errorFilter] : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Transaction Trend</h2>
        {anomalyPoints.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            {anomalyPoints.length} anomaly flagged
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={rows} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="grad-attempts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-successful" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            {errorSeries && (
              <linearGradient id="grad-error" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={errorSeries.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={errorSeries.color} stopOpacity={0} />
              </linearGradient>
            )}
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
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="attempts"
            name="Attempts"
            stroke="#94a3b8"
            fill="url(#grad-attempts)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="successful"
            name="Successful"
            stroke="#10b981"
            fill="url(#grad-successful)"
            strokeWidth={2}
          />
          {errorSeries && (
            <Area
              type="monotone"
              dataKey={errorSeries.key}
              name={errorSeries.label}
              stroke={errorSeries.color}
              fill="url(#grad-error)"
              strokeWidth={2}
            />
          )}
          {anomalyPoints.map((p) => (
            <ReferenceDot key={p.date} x={p.date} y={p.successful} r={5} fill="#f43f5e" stroke="#fff" strokeWidth={2} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
