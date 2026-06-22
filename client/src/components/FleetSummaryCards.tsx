import type { FleetResponse } from '../types';

function Card({ label, value, sub, dot }: { label: string; value: string | number; sub: string; dot: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
      <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-zinc-500">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} />
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">{sub}</p>
    </div>
  );
}

interface Props {
  summary: FleetResponse['summary'];
  avgActive?: { active: number; total: number; days: number };
}

export function FleetSummaryCards({ summary, avgActive }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
      <Card label="Terminals" value={summary.total} sub="in fleet" dot="#6366f1" />
      <Card label="Online" value={summary.online} sub="synced < 15 min" dot="#10b981" />
      <Card label="Syncing" value={summary.syncing} sub="pushing batch now" dot="#3b82f6" />
      <Card label="Needs attn." value={summary.needsAttention} sub="retrying / offline" dot="#f97316" />
      <Card label="Buffered" value={summary.buffered.toLocaleString()} sub="unsynced records" dot="#a78bfa" />
      {avgActive && (
        <Card
          label="Avg. Active"
          value={`${avgActive.active} / ${avgActive.total}`}
          sub={`avg over ${avgActive.days}d`}
          dot="#14b8a6"
        />
      )}
    </div>
  );
}
