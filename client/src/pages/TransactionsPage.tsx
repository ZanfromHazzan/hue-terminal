import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Filters } from '../components/Filters';
import { SummaryCards } from '../components/SummaryCards';
import { FailureComposition } from '../components/FailureComposition';
import { TrendChart } from '../components/TrendChart';
import { TransactionsTable } from '../components/TransactionsTable';
import { AnomalyBanner } from '../components/AnomalyBanner';
import { InsightBanner } from '../components/InsightBanner';
import { ExportCsvButton } from '../components/ExportCsvButton';
import { fetchTransactions, fetchTerminals, fetchLocations } from '../api';
import { recentDates } from '../dateUtils';
import type { ComparePeriod, DayRow, TerminalMeta, TransactionsResponse } from '../types';

export function TransactionsPage() {
  const dates = recentDates(30);
  const [days, setDays] = useState(14);
  const [scope, setScope] = useState('ALL');
  const [comparePeriod, setComparePeriod] = useState<ComparePeriod>('none');
  const [selectedDate, setSelectedDate] = useState(dates[dates.length - 1]);
  const [terminalMeta, setTerminalMeta] = useState<TerminalMeta[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [data, setData] = useState<TransactionsResponse | null>(null);
  const [last14, setLast14] = useState<DayRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTerminals().then((res) => setTerminalMeta(res.meta)).catch(() => {});
    fetchLocations().then(setLocations).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTransactions(days, scope, selectedDate, comparePeriod)
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch(() => setError('Could not load transaction data.'))
      .finally(() => setLoading(false));
  }, [days, scope, selectedDate, comparePeriod]);

  // Fixed 14-day window for the KPI cards' WoW delta + sparkline, independent of
  // whatever range is currently selected for the trend chart/table.
  useEffect(() => {
    fetchTransactions(14, scope, selectedDate)
      .then((res) => setLast14(res.rows))
      .catch(() => {});
  }, [scope, selectedDate]);

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
          scope={scope}
          setScope={setScope}
          terminalMeta={terminalMeta}
          locations={locations}
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
          <InsightBanner days={days} scope={scope} date={selectedDate} />
          <SummaryCards rows={data.rows} last14={last14} />
          <FailureComposition rows={data.rows} />
          <TrendChart
            rows={data.rows}
            priorRows={data.priorRows}
            comparePeriod={comparePeriod}
            onComparePeriodChange={setComparePeriod}
          />
          <div className="flex justify-end">
            <ExportCsvButton rows={data.rows} filename={`omnipay-${scope}-${data.rows[0]?.date}_to_${selectedDate}.csv`} />
          </div>
          <TransactionsTable rows={data.rows} />
        </>
      ) : null}
    </div>
  );
}
