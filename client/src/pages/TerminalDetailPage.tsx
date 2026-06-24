import { useEffect, useState } from 'react';
import { SummaryCards } from '../components/SummaryCards';
import { FailureComposition } from '../components/FailureComposition';
import { TrendChart } from '../components/TrendChart';
import { TransactionsTable } from '../components/TransactionsTable';
import { AnomalyBanner } from '../components/AnomalyBanner';
import { ExportCsvButton } from '../components/ExportCsvButton';
import { DateSelector } from '../components/DateSelector';
import { DayRangeToggle } from '../components/DayRangeToggle';
import { fetchTransactions } from '../api';
import { recentDates } from '../dateUtils';
import type { ComparePeriod, DayRow, FleetTerminal, TransactionsResponse } from '../types';

export function TerminalDetailPage({ terminal, onBack }: { terminal: FleetTerminal; onBack: () => void }) {
  const dates = recentDates(30);
  const [days, setDays] = useState(14);
  const [comparePeriod, setComparePeriod] = useState<ComparePeriod>('none');
  const [selectedDate, setSelectedDate] = useState(dates[dates.length - 1]);
  const [data, setData] = useState<TransactionsResponse | null>(null);
  const [last14, setLast14] = useState<DayRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTransactions(days, terminal.id, selectedDate, comparePeriod)
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch(() => setError('Could not load transaction data.'))
      .finally(() => setLoading(false));
  }, [days, terminal.id, selectedDate, comparePeriod]);

  useEffect(() => {
    fetchTransactions(14, terminal.id, selectedDate)
      .then((res) => setLast14(res.rows))
      .catch(() => {});
  }, [terminal.id, selectedDate]);

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
        <DayRangeToggle days={days} setDays={setDays} />
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
          <SummaryCards rows={data.rows} last14={last14} />
          <FailureComposition rows={data.rows} />
          <TrendChart
            rows={data.rows}
            priorRows={data.priorRows}
            comparePeriod={comparePeriod}
            onComparePeriodChange={setComparePeriod}
          />
          <div className="flex justify-end">
            <ExportCsvButton rows={data.rows} filename={`${terminal.id}-${data.rows[0]?.date}_to_${selectedDate}.csv`} />
          </div>
          <TransactionsTable rows={data.rows} />
        </>
      ) : null}
    </div>
  );
}
