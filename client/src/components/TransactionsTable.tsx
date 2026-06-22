import { useState } from 'react';
import type { DayRow, SortKey } from '../types';

interface Props {
  rows: DayRow[];
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'attempts', label: 'Attempts' },
  { key: 'upstreamRatePct', label: 'Upstream %' },
  { key: 'successRatePct', label: 'Success %' },
  { key: 'customerErrors', label: 'Customer' },
  { key: 'systemErrors', label: 'System' },
  { key: 'localOnly', label: 'Local-only' },
];

export function TransactionsTable({ rows }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 dark:border-white/10 dark:text-zinc-500">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="cursor-pointer select-none px-4 py-2.5 font-medium hover:text-gray-800 dark:hover:text-zinc-300"
                >
                  {col.label}
                  {sortKey === col.key && <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.date}
                className={`border-b border-gray-100 last:border-0 dark:border-white/5 ${
                  row.anomaly ? 'bg-rose-50 dark:bg-rose-500/5' : ''
                }`}
              >
                <td className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-zinc-300">
                  {row.anomaly && <span className="h-1.5 w-1.5 rounded-full bg-rose-400" title="Anomaly" />}
                  {row.date}
                </td>
                <td className="px-4 py-2.5 text-gray-700 dark:text-zinc-300">{row.attempts.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-gray-700 dark:text-zinc-300">{row.upstreamRatePct}%</td>
                <td
                  className={`px-4 py-2.5 font-medium ${
                    row.successRatePct >= 80
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {row.successRatePct}%
                </td>
                <td className="px-4 py-2.5 text-gray-500 dark:text-zinc-400">{row.customerErrors}</td>
                <td className="px-4 py-2.5 text-gray-500 dark:text-zinc-400">{row.systemErrors}</td>
                <td className="px-4 py-2.5 text-gray-500 dark:text-zinc-400">{row.localOnly}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
