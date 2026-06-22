import type { Summary } from '../types';

interface EntityResult {
  label: string;
  summary: Summary | null;
  previousSummary: Summary | null;
}

const METRICS: { key: Exclude<keyof Summary, 'date'>; label: string; pct?: boolean; invert?: boolean }[] = [
  { key: 'attempts', label: 'Attempts' },
  { key: 'upstreamRatePct', label: 'Upstream %', pct: true },
  { key: 'successRatePct', label: 'Success %', pct: true },
  { key: 'failed', label: 'Failed', invert: true },
];

function deltaPct(curr: number, prev: number) {
  if (!prev) return null;
  return ((curr - prev) / prev) * 100;
}

export function CompareTable({ results, comparePeriod }: { results: EntityResult[]; comparePeriod: 'week' | 'month' }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-white/10">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Entity Comparison</h2>
        <p className="text-xs text-gray-400 dark:text-zinc-500">
          Current window vs. {comparePeriod === 'week' ? '7 days prior' : '30 days prior'}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 dark:border-white/10 dark:text-zinc-500">
              <th className="px-4 py-2.5 font-medium">Entity</th>
              {METRICS.map((m) => (
                <th key={m.key} className="px-4 py-2.5 font-medium">
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.label} className="border-b border-gray-100 last:border-0 dark:border-white/5">
                <td className="whitespace-nowrap px-4 py-2.5 font-medium text-gray-900 dark:text-zinc-200">{r.label}</td>
                {METRICS.map((m) => {
                  const curr = r.summary?.[m.key] ?? 0;
                  const prev = r.previousSummary?.[m.key];
                  const delta = prev !== undefined ? deltaPct(curr, prev) : null;
                  const isUp = (delta ?? 0) >= 0;
                  const isGood = m.invert ? !isUp : isUp;
                  return (
                    <td key={m.key} className="px-4 py-2.5 text-gray-700 dark:text-zinc-300">
                      {curr.toLocaleString()}
                      {m.pct ? '%' : ''}
                      {delta !== null && (
                        <span
                          className={`ml-2 text-xs font-medium ${
                            isGood
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isUp ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
