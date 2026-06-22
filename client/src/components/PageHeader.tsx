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
        <DateSelector dates={dates} selected={selectedDate} onChange={onDateChange} />
      </div>
    </div>
  );
}
