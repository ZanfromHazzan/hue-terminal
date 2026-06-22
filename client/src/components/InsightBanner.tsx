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

export function InsightBanner({ days, scope, date }: { days: number; scope: string; date?: string }) {
  const [insight, setInsight] = useState<Insight | null>(null);

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
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-gray-400 dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-500">
        AI insights unavailable{insight.reason ? ` — ${insight.reason}` : ''}
      </div>
    );
  }

  const severity = insight.severity ?? 'info';

  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-4 py-2.5 text-sm ${SEVERITY_STYLES[severity]}`}>
      <span className="mt-0.5 flex-shrink-0 rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide dark:bg-black/20">
        {SEVERITY_LABEL[severity]}
      </span>
      <p>{insight.message}</p>
    </div>
  );
}
