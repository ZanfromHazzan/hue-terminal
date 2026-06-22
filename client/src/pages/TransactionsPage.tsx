import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Filters } from '../components/Filters';
import { SummaryCards } from '../components/SummaryCards';
import { TrendChart } from '../components/TrendChart';
import { TransactionsTable } from '../components/TransactionsTable';
import { AnomalyBanner } from '../components/AnomalyBanner';
import { fetchTransactions, fetchTerminals } from '../api';
import type { ErrorFilter, TransactionsResponse } from '../types';

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

export function TransactionsPage() {
  const dates = recentDates(30);
  const [days, setDays] = useState(14);
  const [terminal, setTerminal] = useState('ALL');
  const [errorFilter, setErrorFilter] = useState<ErrorFilter>('all');
  const [selectedDate, setSelectedDate] = useState(dates[dates.length - 1]);
  const [terminals, setTerminals] = useState<string[]>(['ALL']);
  const [data, setData] = useState<TransactionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTerminals().then(setTerminals).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTransactions(days, terminal, selectedDate)
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch(() => setError('Could not load transaction data.'))
      .finally(() => setLoading(false));
  }, [days, terminal, selectedDate]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transaction Overview"
        subtitle="Every payment attempt from card-insert + PIN — upstream and local-only."
        dates={dates}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-zinc-300">{days}-day window</h3>
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
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="py-20 text-center text-sm text-gray-400 dark:text-zinc-500">Loading transaction data…</div>
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
