interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
  max?: number;
}

export function EntityMultiSelect({ options, selected, onToggle, max = 5 }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        const disabled = !isSelected && selected.length >= max;
        return (
          <button
            key={opt.value}
            disabled={disabled}
            onClick={() => onToggle(opt.value)}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
              isSelected
                ? 'border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-400 dark:bg-violet-500/10 dark:text-violet-200'
                : disabled
                  ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 dark:border-white/5 dark:bg-zinc-900/40 dark:text-zinc-600'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-300'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
