import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { SyncPolicyBanner } from '../components/SyncPolicyBanner';
import { FleetSummaryCards } from '../components/FleetSummaryCards';
import { FleetTable } from '../components/FleetTable';
import { LocationFilter } from '../components/LocationFilter';
import { SearchInput } from '../components/SearchInput';
import { DayRangeToggle } from '../components/DayRangeToggle';
import { fetchFleet, fetchFleetHistory, fetchLocations } from '../api';
import type { FleetResponse, FleetHistoryResponse, FleetTerminal } from '../types';

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

function matchesSearch(t: FleetTerminal, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return t.id.toLowerCase().includes(q) || t.store.toLowerCase().includes(q) || t.city.toLowerCase().includes(q);
}

export function FleetPage({ onSelectTerminal }: { onSelectTerminal: (terminal: FleetTerminal) => void }) {
  const dates = recentDates(14);
  const [selectedDate, setSelectedDate] = useState(dates[dates.length - 1]);
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [historyDays, setHistoryDays] = useState(14);
  const [locations, setLocations] = useState<string[]>([]);
  const [data, setData] = useState<FleetResponse | null>(null);
  const [history, setHistory] = useState<FleetHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations().then(setLocations).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchFleet(selectedDate, city || undefined)
      .then(setData)
      .finally(() => setLoading(false));
  }, [selectedDate, city]);

  useEffect(() => {
    fetchFleetHistory(historyDays, selectedDate, city || undefined)
      .then(setHistory)
      .catch(() => {});
  }, [historyDays, selectedDate, city]);

  const filteredTerminals = data ? data.terminals.filter((t) => matchesSearch(t, search)) : [];

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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-zinc-300">Avg. active window: {historyDays}d</h3>
        <div className="flex flex-wrap items-center gap-3">
          <DayRangeToggle days={historyDays} setDays={setHistoryDays} />
          <LocationFilter locations={locations} value={city} onChange={setCity} />
          <SearchInput value={search} onChange={setSearch} placeholder="Search terminal, store, city…" />
        </div>
      </div>

      {loading && !data ? (
        <div className="py-20 text-center text-sm text-gray-400 dark:text-zinc-500">Loading fleet status…</div>
      ) : data ? (
        <>
          <FleetSummaryCards
            summary={data.summary}
            avgActive={
              history ? { active: history.avgActive, total: history.avgTotal, days: historyDays } : undefined
            }
          />
          <FleetTable terminals={filteredTerminals} onSelect={onSelectTerminal} />
        </>
      ) : null}
    </div>
  );
}
