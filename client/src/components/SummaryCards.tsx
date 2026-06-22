import type { Summary } from '../types';

interface Props {
  summary: Summary | null;
}

function Card({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-500">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold ${tone ?? 'text-gray-900 dark:text-white'}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">{sub}</p>
    </div>
  );
}

export function SummaryCards({ summary }: Props) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Card label="Attempts" value={summary.attempts.toLocaleString()} sub={summary.date} />
      <Card
        label="Reached Upstream"
        value={summary.upstream.toLocaleString()}
        sub={`${summary.upstreamRatePct}%`}
      />
      <Card
        label="Successful"
        value={summary.successful.toLocaleString()}
        sub={`${summary.successRatePct}% success rate`}
        tone="text-emerald-600 dark:text-emerald-400"
      />
      <Card
        label="Failed"
        value={summary.failed.toLocaleString()}
        sub={`${summary.customerErrors} customer · ${summary.systemErrors} system · ${summary.localOnly} local`}
        tone="text-rose-600 dark:text-rose-400"
      />
    </div>
  );
}
