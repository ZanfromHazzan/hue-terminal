import { useEffect, useState } from 'react';
import { SummaryCards } from '../components/SummaryCards';
import { TrendChart } from '../components/TrendChart';
import { TransactionsTable } from '../components/TransactionsTable';
import { AnomalyBanner } from '../components/AnomalyBanner';
import { DateSelector } from '../components/DateSelector';
import { fetchTransactions } from '../api';
import type { ErrorFilter, FleetTerminal, TransactionsResponse } from '../types';

function recentDates(n: number) {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

const DAY_OPTIONS = [7, 14, 30, 60];
const ERROR_OPTIONS: { value: ErrorFilter; label: string }[] = [
  { value: 'all', label: 'All errors' },
  { value: 'customer', label: 'Customer errors' },
  { value: 'system', label: 'System errors' },
  { value: 'local', label: 'Local-only' },
];

export function TerminalDetailPage({ terminal, onBack }: { terminal: FleetTerminal; onBack: () => void }) {
  const dates = recentDates(30);
  const [days, setDays] = useState(14);
  const [errorFilter, setErrorFilter] = useState<ErrorFilter>('all');
  const [selectedDate, setSelectedDate] = useState(dates[dates.length - 1]);
  const [data, setData] = useState<TransactionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTransactions(days, terminal.id, selectedDate)
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch(() => setError('Could not load transaction data.'))
      .finally(() => setLoading(false));
  }, [days, terminal.id, selectedDate]);

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to fleet
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-5 dark:border-white/10">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{terminal.id}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-500">
            {terminal.store} · {terminal.city}
          </p>
        </div>
        <DateSelector dates={dates} selected={selectedDate} onChange={setSelectedDate} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-zinc-300">{days}-day window</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-zinc-900/60 dark:ring-1 dark:ring-white/10">
            {DAY_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setDays(opt)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  days === opt
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-violet-500/20 dark:text-violet-200 dark:shadow-none'
                    : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {opt}d
              </button>
            ))}
          </div>
          <select
            value={errorFilter}
            onChange={(e) => setErrorFilter(e.target.value as ErrorFilter)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200"
          >
            {ERROR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="py-20 text-center text-sm text-gray-400 dark:text-zinc-500">Loading terminal data…</div>
      ) : data ? (
        <>
          <AnomalyBanner count={data.anomalyCount} />
          <SummaryCards summary={data.summary} />
          <TrendChart rows={data.rows} errorFilter={errorFilter} />
          <TransactionsTable rows={data.rows} />
        </>
      ) : null}
    </div>
  );
}
