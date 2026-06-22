import type {
  ComparePeriod,
  FleetHistoryResponse,
  FleetResponse,
  Insight,
  TerminalMeta,
  TransactionsResponse,
} from './types';

export async function fetchTransactions(
  days: number,
  terminal: string,
  date?: string,
  compare: ComparePeriod = 'none'
): Promise<TransactionsResponse> {
  const params = new URLSearchParams({ days: String(days), terminal });
  if (date) params.set('date', date);
  if (compare !== 'none') params.set('compare', compare);

  const res = await fetch(`/api/transactions?${params.toString()}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function fetchTerminals(): Promise<{ terminals: string[]; meta: TerminalMeta[] }> {
  const res = await fetch('/api/terminals');
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function fetchLocations(): Promise<string[]> {
  const res = await fetch('/api/locations');
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data = await res.json();
  return data.locations;
}

export async function fetchFleet(date?: string, city?: string): Promise<FleetResponse> {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (city) params.set('city', city);
  const res = await fetch(`/api/fleet?${params.toString()}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function fetchFleetHistory(days: number, date?: string, city?: string): Promise<FleetHistoryResponse> {
  const params = new URLSearchParams({ days: String(days) });
  if (date) params.set('date', date);
  if (city) params.set('city', city);
  const res = await fetch(`/api/fleet/history?${params.toString()}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function fetchInsight(days: number, terminal: string, date?: string): Promise<Insight> {
  const params = new URLSearchParams({ days: String(days), terminal });
  if (date) params.set('date', date);
  const res = await fetch(`/api/insights?${params.toString()}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}
