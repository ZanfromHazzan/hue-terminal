import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { SyncPolicyBanner } from '../components/SyncPolicyBanner';
import { FleetSummaryCards } from '../components/FleetSummaryCards';
import { FleetTable } from '../components/FleetTable';
import { fetchFleet } from '../api';
import type { FleetResponse, FleetTerminal } from '../types';

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

export function FleetPage({ onSelectTerminal }: { onSelectTerminal: (terminal: FleetTerminal) => void }) {
  const dates = recentDates(14);
  const [selectedDate, setSelectedDate] = useState(dates[dates.length - 1]);
  const [data, setData] = useState<FleetResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchFleet(selectedDate)
      .then(setData)
      .finally(() => setLoading(false));
  }, [selectedDate]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Terminal Sync & Status"
        subtitle="Local buffering and backend sync health across the terminal fleet."
        dates={dates}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <SyncPolicyBanner />

      {loading && !data ? (
        <div className="py-20 text-center text-sm text-gray-400 dark:text-zinc-500">Loading fleet status…</div>
      ) : data ? (
        <>
          <FleetSummaryCards summary={data.summary} />
          <FleetTable terminals={data.terminals} onSelect={onSelectTerminal} />
        </>
      ) : null}
    </div>
  );
}
