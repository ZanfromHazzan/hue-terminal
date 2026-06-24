import { DayRangeToggle } from './DayRangeToggle';
import type { TerminalMeta } from '../types';

interface Props {
  days: number;
  setDays: (d: number) => void;
  scope: string;
  setScope: (s: string) => void;
  terminalMeta: TerminalMeta[];
  locations: string[];
}

export function Filters({ days, setDays, scope, setScope, terminalMeta, locations }: Props) {
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
    </div>
  );
}
