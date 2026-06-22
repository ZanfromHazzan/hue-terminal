import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { Filters } from './components/Filters';
import { TrendChart } from './components/TrendChart';
import { TransactionsTable } from './components/TransactionsTable';
import { AnomalyBanner } from './components/AnomalyBanner';
import { fetchTransactions, fetchTerminals } from './api';
import type { ErrorFilter, TransactionsResponse } from './types';

export default function App() {
  const [days, setDays] = useState(14);
  const [terminal, setTerminal] = useState('ALL');
  const [errorFilter, setErrorFilter] = useState<ErrorFilter>('all');
  const [terminals, setTerminals] = useState<string[]>(['ALL']);
  const [data, setData] = useState<TransactionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTerminals().then(setTerminals).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTransactions(days, terminal)
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch(() => setError('Could not load transaction data.'))
      .finally(() => setLoading(false));
  }, [days, terminal]);

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-zinc-200">
      <Header syncedAt={data?.syncedAt ?? null} />

      <main className="mx-auto max-w-6xl space-y-5 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-medium text-white">Daily Overview</h2>
          <Filters
            days={days}
            setDays={setDays}
            terminal={terminal}
            setTerminal={setTerminal}
            terminals={terminals}
            errorFilter={errorFilter}
            setErrorFilter={setErrorFilter}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">
            {error}
          </div>
        )}

        {loading && !data ? (
          <div className="py-20 text-center text-sm text-zinc-500">Loading transaction data…</div>
        ) : data ? (
          <>
            <AnomalyBanner count={data.anomalyCount} />
            <SummaryCards summary={data.summary} />
            <TrendChart rows={data.rows} errorFilter={errorFilter} />
            <TransactionsTable rows={data.rows} />
          </>
        ) : null}
      </main>
    </div>
  );
}
