import { useEffect, useState } from 'react';
import { fetchInsight } from '../api';
import type { Insight } from '../types';

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
  warning:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
  info: 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200',
};

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'Critical',
  warning: 'Worth a look',
  info: 'AI Insight',
};

function RegenerateButton({ onClick, spinning }: { onClick: () => void; spinning: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={spinning}
      title="Generate a fresh insight now"
      className="flex-shrink-0 rounded-md p-1 text-current opacity-60 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-3.5 w-3.5 ${spinning ? 'animate-spin' : ''}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M17.65 6.35A8 8 0 1019.5 13M19.5 13H15M19.5 13V8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function InsightBanner({ days, scope, date }: { days: number; scope: string; date?: string }) {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setInsight(null);
    fetchInsight(days, scope, date)
      .then((res) => {
        if (!cancelled) setInsight(res);
      })
      .catch(() => {
        if (!cancelled) setInsight({ available: false, reason: 'Request failed' });
      });
    return () => {
      cancelled = true;
    };
  }, [days, scope, date]);

  function regenerate() {
    setRegenerating(true);
    fetchInsight(days, scope, date, true)
      .then(setInsight)
      .catch(() => setInsight({ available: false, reason: 'Request failed' }))
      .finally(() => setRegenerating(false));
  }

  if (!insight) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-500">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-400 dark:bg-zinc-500" />
        Generating AI insight…
      </div>
    );
  }

  if (!insight.available) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-gray-400 dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-500">
        <span>AI insights unavailable{insight.reason ? ` — ${insight.reason}` : ''}</span>
      </div>
    );
  }

  const severity = insight.severity ?? 'info';

  return (
    <div className={`flex items-start justify-between gap-2.5 rounded-lg border px-4 py-2.5 text-sm ${SEVERITY_STYLES[severity]}`}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex-shrink-0 rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide dark:bg-black/20">
          {SEVERITY_LABEL[severity]}
        </span>
        <p>{insight.message}</p>
      </div>
      <RegenerateButton onClick={regenerate} spinning={regenerating} />
    </div>
  );
}
