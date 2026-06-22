import { DayRangeToggle } from './DayRangeToggle';
import type { ErrorFilter, TerminalMeta } from '../types';

interface Props {
  days: number;
  setDays: (d: number) => void;
  scope: string;
  setScope: (s: string) => void;
  terminalMeta: TerminalMeta[];
  locations: string[];
  errorFilter: ErrorFilter;
  setErrorFilter: (f: ErrorFilter) => void;
}

const ERROR_OPTIONS: { value: ErrorFilter; label: string }[] = [
  { value: 'all', label: 'All errors' },
  { value: 'customer', label: 'Customer errors' },
  { value: 'system', label: 'System errors' },
  { value: 'local', label: 'Local-only' },
];

export function Filters({
  days,
  setDays,
  scope,
  setScope,
  terminalMeta,
  locations,
  errorFilter,
  setErrorFilter,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <DayRangeToggle days={days} setDays={setDays} />

      <select
        value={scope}
        onChange={(e) => setScope(e.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200"
      >
        <option value="ALL">All terminals</option>
        <optgroup label="By location">
          {locations.map((loc) => (
            <option key={loc} value={`CITY:${loc}`}>
              {loc}
            </option>
          ))}
        </optgroup>
        <optgroup label="By terminal">
          {terminalMeta.map((t) => (
            <option key={t.id} value={t.id}>
              {t.id} · {t.store}
            </option>
          ))}
        </optgroup>
      </select>

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
  );
}
