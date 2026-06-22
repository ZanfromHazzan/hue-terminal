import { useMemo } from 'react';
import type { DayRow } from '../types';

const METRICS: { key: keyof DayRow; label: string }[] = [
  { key: 'attempts', label: 'Attempts' },
  { key: 'upstreamRatePct', label: 'Upstream %' },
  { key: 'successRatePct', label: 'Success %' },
  { key: 'customerErrors', label: 'Cust. Errors' },
  { key: 'systemErrors', label: 'Sys. Errors' },
  { key: 'localOnly', label: 'Local-Only' },
];

function pearson(xs: number[], ys: number[]) {
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return 0;
  return num / Math.sqrt(denX * denY);
}

function colorFor(r: number) {
  const alpha = Math.min(1, Math.abs(r));
  return r >= 0 ? `rgba(16, 185, 129, ${alpha})` : `rgba(244, 63, 94, ${alpha})`;
}

export function CorrelationMatrix({ rows }: { rows: DayRow[] }) {
  const matrix = useMemo(() => {
    return METRICS.map((rowMetric) =>
      METRICS.map((colMetric) => {
        const xs = rows.map((r) => r[rowMetric.key] as number);
        const ys = rows.map((r) => r[colMetric.key] as number);
        return pearson(xs, ys);
      })
    );
  }, [rows]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Correlation Matrix</h2>
      <p className="mb-3 text-xs text-gray-400 dark:text-zinc-500">
        Pearson correlation across the {rows.length}-day window · green = positive, red = negative
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-center text-xs">
          <thead>
            <tr>
              <th className="px-2 py-1.5"></th>
              {METRICS.map((m) => (
                <th key={m.key} className="px-2 py-1.5 font-medium text-gray-500 dark:text-zinc-500">
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((rowMetric, i) => (
              <tr key={rowMetric.key}>
                <td className="px-2 py-1.5 text-right font-medium text-gray-500 dark:text-zinc-500">
                  {rowMetric.label}
                </td>
                {METRICS.map((colMetric, j) => (
                  <td key={colMetric.key} className="p-1">
                    <div
                      className="rounded px-2 py-1.5 font-medium text-gray-900 dark:text-white"
                      style={{ backgroundColor: i === j ? 'transparent' : colorFor(matrix[i][j]) }}
                    >
                      {matrix[i][j].toFixed(2)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
