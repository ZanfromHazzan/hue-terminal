import { downloadCsv } from '../csv';
import type { DayRow } from '../types';

export function ExportCsvButton({ rows, filename }: { rows: DayRow[]; filename: string }) {
  return (
    <button
      onClick={() => downloadCsv(filename, rows)}
      disabled={rows.length === 0}
      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-white/5"
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Export CSV
    </button>
  );
}
