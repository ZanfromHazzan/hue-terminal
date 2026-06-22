interface Props {
  dates: string[];
  selected: string;
  onChange: (date: string) => void;
}

function formatFull(d: string) {
  return new Date(d).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function DateSelector({ dates, selected, onChange }: Props) {
  const latest = dates[dates.length - 1];
  const isLatest = selected === latest;

  return (
    <div className="relative">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm font-medium text-gray-900 shadow-sm focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
      >
        {[...dates].reverse().map((d) => (
          <option key={d} value={d}>
            {formatFull(d)}
          </option>
        ))}
      </select>
      <p className="pointer-events-none absolute -bottom-4 left-0 text-[11px] text-gray-400 dark:text-zinc-500">
        {isLatest ? 'Yesterday · latest full day' : 'Historical'}
      </p>
    </div>
  );
}
