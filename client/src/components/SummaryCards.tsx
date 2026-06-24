import { Sparkline } from './Sparkline';
import type { DayRow } from '../types';

interface Props {
  rows: DayRow[];
  last14: DayRow[];
}

type MetricKey = 'attempts' | 'upstream' | 'successful' | 'failed';

function metricValue(row: DayRow, key: MetricKey): number {
  if (key === 'failed') return row.customerErrors + row.systemErrors + row.localOnly;
  return row[key];
}

function sum(rows: DayRow[], key: MetricKey): number {
  return rows.reduce((acc, r) => acc + metricValue(r, key), 0);
}

function Delta({ value }: { value: number | null }) {
  if (value === null) return null;
  const isUp = value >= 0;
  return (
    <span className={`text-xs font-semibold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
      {isUp ? '▲' : '▼'} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function Card({
  label,
  value,
  sub,
  tone,
  sparklineValues,
  sparklineColor,
  wowDelta,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: string;
  sparklineValues: number[];
  sparklineColor: string;
  wowDelta: number | null;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-500">{label}</p>
        <Delta value={wowDelta} />
      </div>
      <div className="mt-1.5 flex items-end justify-between gap-3">
        <p className={`text-2xl font-semibold ${tone ?? 'text-gray-900 dark:text-white'}`}>{value}</p>
        <Sparkline values={sparklineValues} color={sparklineColor} />
      </div>
      <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">{sub}</p>
    </div>
  );
}

// Week-on-week delta computed from a fixed trailing 14-day window, independent of
// whatever date range is currently selected for the main cards.
function wowDelta(last14: DayRow[], key: MetricKey, invert = false): number | null {
  if (last14.length < 14) return null;
  const thisWeek = sum(last14.slice(-7), key);
  const prevWeek = sum(last14.slice(-14, -7), key);
  if (prevWeek === 0) return null;
  const pct = ((thisWeek - prevWeek) / prevWeek) * 100;
  return invert ? -pct : pct;
}

export function SummaryCards({ rows, last14 }: Props) {
  if (rows.length === 0) return null;

  const attempts = sum(rows, 'attempts');
  const upstream = sum(rows, 'upstream');
  const successful = sum(rows, 'successful');
  const customerErrors = rows.reduce((a, r) => a + r.customerErrors, 0);
  const systemErrors = rows.reduce((a, r) => a + r.systemErrors, 0);
  const localOnly = rows.reduce((a, r) => a + r.localOnly, 0);
  const failed = customerErrors + systemErrors + localOnly;

  const upstreamRatePct = attempts ? ((upstream / attempts) * 100).toFixed(1) : '0.0';
  const successRatePct = upstream ? ((successful / upstream) * 100).toFixed(1) : '0.0';

  const sparklineFor = (key: MetricKey): number[] => last14.map((r) => metricValue(r, key));

  const rangeLabel = rows.length > 1 ? `${rows[0].date} → ${rows[rows.length - 1].date}` : `${rows.length}-day total`;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Card
        label="Attempts"
        value={attempts.toLocaleString()}
        sub={rangeLabel}
        sparklineValues={sparklineFor('attempts')}
        sparklineColor="#3b82f6"
        wowDelta={wowDelta(last14, 'attempts')}
      />
      <Card
        label="Reached Upstream"
        value={upstream.toLocaleString()}
        sub={`${upstreamRatePct}% of attempts`}
        sparklineValues={sparklineFor('upstream')}
        sparklineColor="#0ea5e9"
        wowDelta={wowDelta(last14, 'upstream')}
      />
      <Card
        label="Successful"
        value={successful.toLocaleString()}
        sub={`${successRatePct}% success rate`}
        tone="text-emerald-600 dark:text-emerald-400"
        sparklineValues={sparklineFor('successful')}
        sparklineColor="#10b981"
        wowDelta={wowDelta(last14, 'successful')}
      />
      <Card
        label="Failed"
        value={failed.toLocaleString()}
        sub={`${customerErrors} customer · ${systemErrors} system · ${localOnly} local`}
        tone="text-rose-600 dark:text-rose-400"
        sparklineValues={sparklineFor('failed')}
        sparklineColor="#f43f5e"
        wowDelta={wowDelta(last14, 'failed', true)}
      />
    </div>
  );
}
