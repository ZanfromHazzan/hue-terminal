import { useEffect, useState } from 'react';
import { DayRangeToggle } from '../components/DayRangeToggle';
import { EntityMultiSelect } from '../components/EntityMultiSelect';
import { CompareTable } from '../components/CompareTable';
import { CompareChart } from '../components/CompareChart';
import { CorrelationMatrix } from '../components/CorrelationMatrix';
import { fetchTransactions, fetchLocations, fetchTerminals } from '../api';
import type { ComparePeriod, DayRow, Summary, TerminalMeta } from '../types';

interface EntityResult {
  label: string;
  scope: string;
  summary: Summary | null;
  previousSummary: Summary | null;
  rows: DayRow[];
}

export function ComparePage() {
  const [dimension, setDimension] = useState<'location' | 'terminal'>('location');
  const [locations, setLocations] = useState<string[]>([]);
  const [terminalMeta, setTerminalMeta] = useState<TerminalMeta[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [days, setDays] = useState(14);
  const [comparePeriod, setComparePeriod] = useState<ComparePeriod>('week');
  const [results, setResults] = useState<EntityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [correlationScope, setCorrelationScope] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations().then((locs) => {
      setLocations(locs);
      setSelected(locs.slice(0, 3).map((l) => `CITY:${l}`));
    });
    fetchTerminals().then((res) => setTerminalMeta(res.meta));
  }, []);

  function switchDimension(next: 'location' | 'terminal') {
    setDimension(next);
    if (next === 'location') {
      setSelected(locations.slice(0, 3).map((l) => `CITY:${l}`));
    } else {
      setSelected(terminalMeta.slice(0, 3).map((t) => t.id));
    }
  }

  useEffect(() => {
    if (selected.length === 0) return;
    setLoading(true);
    Promise.all(
      selected.map((scope) =>
        fetchTransactions(days, scope, undefined, comparePeriod).then((res) => ({
          label: scope.startsWith('CITY:') ? scope.slice(5) : scope,
          scope,
          summary: res.summary,
          previousSummary: res.previousSummary,
          rows: res.rows,
        }))
      )
    )
      .then((res) => {
        setResults(res);
        setCorrelationScope((prev) => (prev && res.some((r) => r.scope === prev) ? prev : res[0]?.scope ?? null));
      })
      .finally(() => setLoading(false));
  }, [selected, days, comparePeriod]);

  const options =
    dimension === 'location'
      ? locations.map((l) => ({ value: `CITY:${l}`, label: l }))
      : terminalMeta.map((t) => ({ value: t.id, label: `${t.id} · ${t.store}` }));

  return (
    <div className="space-y-5">
      <div className="border-b border-gray-200 pb-5 dark:border-white/10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Compare & Correlate</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-500">
          Compare locations or terminals across periods, and explore metric relationships.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-zinc-900/60 dark:ring-1 dark:ring-white/10">
          {(['location', 'terminal'] as const).map((d) => (
            <button
              key={d}
              onClick={() => switchDimension(d)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                dimension === d
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-violet-500/20 dark:text-violet-200 dark:shadow-none'
                  : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              By {d}
            </button>
          ))}
        </div>
        <DayRangeToggle days={days} setDays={setDays} />
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-zinc-900/60 dark:ring-1 dark:ring-white/10">
          {(['week', 'month'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setComparePeriod(c)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                comparePeriod === c
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-violet-500/20 dark:text-violet-200 dark:shadow-none'
                  : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              vs. {c === 'week' ? '7d prior' : '30d prior'}
            </button>
          ))}
        </div>
      </div>

      <EntityMultiSelect
        options={options}
        selected={selected}
        onToggle={(value) =>
          setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
        }
      />

      {loading && results.length === 0 ? (
        <div className="py-20 text-center text-sm text-gray-400 dark:text-zinc-500">Loading comparison…</div>
      ) : results.length > 0 ? (
        <>
          <CompareTable results={results} comparePeriod={comparePeriod === 'none' ? 'week' : comparePeriod} />
          <CompareChart entities={results.map((r) => ({ label: r.label, rows: r.rows }))} />
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-zinc-300">Correlation for:</h3>
            <select
              value={correlationScope ?? ''}
              onChange={(e) => setCorrelationScope(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200"
            >
              {results.map((r) => (
                <option key={r.scope} value={r.scope}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          {(() => {
            const target = results.find((r) => r.scope === correlationScope) ?? results[0];
            return target ? <CorrelationMatrix rows={target.rows} /> : null;
          })()}
        </>
      ) : (
        <p className="py-10 text-center text-sm text-gray-400 dark:text-zinc-500">
          Select at least one {dimension} to compare.
        </p>
      )}
    </div>
  );
}
