interface Props {
  locations: string[];
  value: string;
  onChange: (v: string) => void;
}

export function LocationFilter({ locations, value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200"
    >
      <option value="">All locations</option>
      {locations.map((loc) => (
        <option key={loc} value={loc}>
          {loc}
        </option>
      ))}
    </select>
  );
}
