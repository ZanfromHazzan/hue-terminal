import type { Summary } from '../types';

interface Props {
  summary: Summary | null;
}

function Card({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'default' | 'good' | 'bad';
}) {
  const toneClass =
    tone === 'good' ? 'text-emerald-400' : tone === 'bad' ? 'text-rose-400' : 'text-white';

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold ${toneClass}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
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
        tone="good"
      />
      <Card
        label="Failed"
        value={(summary.customerErrors + summary.systemErrors + summary.localOnly).toLocaleString()}
        sub={`${summary.customerErrors} customer · ${summary.systemErrors} system · ${summary.localOnly} local`}
        tone="bad"
      />
    </div>
  );
}
