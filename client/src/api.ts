import type { ComparePeriod, FleetResponse, TransactionsResponse } from './types';

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

export async function fetchTerminals(): Promise<string[]> {
  const res = await fetch('/api/terminals');
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data = await res.json();
  return data.terminals;
}

export async function fetchFleet(date?: string): Promise<FleetResponse> {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  const res = await fetch(`/api/fleet?${params.toString()}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}
