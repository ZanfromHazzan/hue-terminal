interface Props {
  days: number;
  setDays: (d: number) => void;
  terminal: string;
  setTerminal: (t: string) => void;
  terminals: string[];
}

const DAY_OPTIONS = [7, 14, 30, 60];

export function Filters({ days, setDays, terminal, setTerminal, terminals }: Props) {
  return (
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
        value={terminal}
        onChange={(e) => setTerminal(e.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200"
      >
        {terminals.map((t) => (
          <option key={t} value={t}>
            {t === 'ALL' ? 'All terminals' : t}
          </option>
        ))}
      </select>
    </div>
  );
}
