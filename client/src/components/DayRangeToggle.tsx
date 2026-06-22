const DAY_OPTIONS = [7, 14, 30, 60];

export function DayRangeToggle({ days, setDays }: { days: number; setDays: (d: number) => void }) {
  return (
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
  );
}
