import type { DayRow } from './types';

const COLUMNS: { key: string; label: string; get: (r: DayRow) => string | number }[] = [
  { key: 'date', label: 'date', get: (r) => r.date },
  { key: 'attempts', label: 'attempts', get: (r) => r.attempts },
  { key: 'upstream', label: 'upstream', get: (r) => r.upstream },
  { key: 'successful', label: 'successful', get: (r) => r.successful },
  { key: 'failed_customer_error', label: 'failed_customer_error', get: (r) => r.customerErrors },
  { key: 'failed_system_error', label: 'failed_system_error', get: (r) => r.systemErrors },
  { key: 'local_only', label: 'local_only', get: (r) => r.localOnly },
  { key: 'failed', label: 'failed', get: (r) => r.customerErrors + r.systemErrors + r.localOnly },
  { key: 'success_rate', label: 'success_rate', get: (r) => r.successRatePct / 100 },
  {
    key: 'customer_error_rate',
    label: 'customer_error_rate',
    get: (r) => (r.upstream > 0 ? r.customerErrors / r.upstream : 0),
  },
  {
    key: 'system_error_rate',
    label: 'system_error_rate',
    get: (r) => (r.upstream > 0 ? r.systemErrors / r.upstream : 0),
  },
  {
    key: 'local_only_rate',
    label: 'local_only_rate',
    get: (r) => (r.attempts > 0 ? r.localOnly / r.attempts : 0),
  },
];

export function rowsToCsv(rows: DayRow[]): string {
  const header = COLUMNS.map((c) => c.label).join(',');
  const lines = rows.map((r) => COLUMNS.map((c) => c.get(r)).join(','));
  return [header, ...lines].join('\n');
}

export function downloadCsv(filename: string, rows: DayRow[]) {
  const csv = rowsToCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
