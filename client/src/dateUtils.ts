// Local-date formatting that avoids the UTC-parse/convert rollback `toISOString()` can
// cause in negative UTC offsets — mirrors server/data.js's dateKey().
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// The dashboard never shows "today" — a day isn't final until the next day's rollup,
// so the latest selectable day is always yesterday.
export function yesterday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 1);
  return d;
}

export function yesterdayKey(): string {
  return dateKey(yesterday());
}

// Last `n` selectable dates ending at yesterday.
export function recentDates(n: number): string[] {
  const end = yesterday();
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    dates.push(dateKey(d));
  }
  return dates;
}
