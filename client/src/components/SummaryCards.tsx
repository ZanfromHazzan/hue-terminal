import type { ReactNode } from 'react';
import type { Summary } from '../types';

interface Props {
  summary: Summary | null;
  previous: Summary | null;
}

function Delta({ current, previous, invert = false }: { current: number; previous?: number; invert?: boolean }) {
  if (previous === undefined || previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  const isUp = pct >= 0;
  const isGood = invert ? !isUp : isUp;

  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
        isGood
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
          : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
      }`}
    >
      {isUp ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function Card({
  label,
  value,
  sub,
  accent,
  delta,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  delta?: ReactNode;
}) {
  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60"
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-500">{label}</p>
        {delta}
      </div>
      <p className="mt-1.5 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">{sub}</p>}
    </div>
  );
}

export function SummaryCards({ summary, previous }: Props) {
  if (!summary) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
        Summary · {new Date(summary.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card
          label="Total Attempts"
          value={summary.attempts.toLocaleString()}
          sub="card-insert + PIN entered"
          accent="#3b82f6"
          delta={<Delta current={summary.attempts} previous={previous?.attempts} />}
        />
        <Card
          label="Upstream Transactions"
          value={summary.upstream.toLocaleString()}
          sub={`${summary.upstreamRatePct}% reached backend`}
          accent="#0ea5e9"
          delta={<Delta current={summary.upstream} previous={previous?.upstream} />}
        />
        <Card
          label="Successful"
          value={summary.successful.toLocaleString()}
          sub="outcome = SUCCESS"
          accent="#10b981"
          delta={<Delta current={summary.successful} previous={previous?.successful} />}
        />
        <Card
          label="Failed Transactions"
          value={summary.failed.toLocaleString()}
          sub="customer + system + local-only"
          accent="#f43f5e"
          delta={<Delta current={summary.failed} previous={previous?.failed} invert />}
        />
        <Card
          label="Customer Errors"
          value={summary.customerErrors.toLocaleString()}
          sub="wrong PIN, low funds, expired"
          accent="#f97316"
          delta={<Delta current={summary.customerErrors} previous={previous?.customerErrors} invert />}
        />
        <Card
          label="System Errors"
          value={summary.systemErrors.toLocaleString()}
          sub="network, terminal, timeout"
          accent="#f43f5e"
          delta={<Delta current={summary.systemErrors} previous={previous?.systemErrors} invert />}
        />
        <Card
          label="Local-Only"
          value={summary.localOnly.toLocaleString()}
          sub="never reached backend"
          accent="#a78bfa"
          delta={<Delta current={summary.localOnly} previous={previous?.localOnly} invert />}
        />
        <Card
          label="Success Rate"
          value={`${summary.successRatePct}%`}
          sub="success / total attempts"
          accent="#10b981"
          delta={<Delta current={summary.successRatePct} previous={previous?.successRatePct} />}
        />
      </div>
    </div>
  );
}
