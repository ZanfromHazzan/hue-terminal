import { DateSelector } from './DateSelector';

interface Props {
  title: string;
  subtitle: string;
  dates: string[];
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function PageHeader({ title, subtitle, dates, selectedDate, onDateChange }: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-5 dark:border-white/10">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
          Daily snapshot · no intraday refresh
        </span>
        <DateSelector dates={dates} selected={selectedDate} onChange={onDateChange} />
      </div>
    </div>
  );
}
