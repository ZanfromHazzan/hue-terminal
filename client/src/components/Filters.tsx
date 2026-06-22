import type { ErrorFilter } from '../types';

interface Props {
  days: number;
  setDays: (d: number) => void;
  terminal: string;
  setTerminal: (t: string) => void;
  terminals: string[];
  errorFilter: ErrorFilter;
  setErrorFilter: (f: ErrorFilter) => void;
}

const DAY_OPTIONS = [7, 14, 30, 60];
const ERROR_OPTIONS: { value: ErrorFilter; label: string }[] = [
  { value: 'all', label: 'All errors' },
  { value: 'customer', label: 'Customer' },
  { value: 'system', label: 'System' },
  { value: 'local', label: 'Local-only' },
];

export function Filters({
  days,
  setDays,
  terminal,
  setTerminal,
  terminals,
  errorFilter,
  setErrorFilter,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <div className="flex items-center gap-1 rounded-lg bg-zinc-900/60 p-1 ring-1 ring-white/10">
        {DAY_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => setDays(opt)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              days === opt ? 'bg-violet-500/20 text-violet-200' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {opt}d
          </button>
        ))}
      </div>

      <select
        value={terminal}
        onChange={(e) => setTerminal(e.target.value)}
        className="rounded-lg bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-200 ring-1 ring-white/10 focus:outline-none"
      >
        {terminals.map((t) => (
          <option key={t} value={t}>
            {t === 'ALL' ? 'All terminals' : t}
          </option>
        ))}
      </select>

      <select
        value={errorFilter}
        onChange={(e) => setErrorFilter(e.target.value as ErrorFilter)}
        className="rounded-lg bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-200 ring-1 ring-white/10 focus:outline-none"
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
