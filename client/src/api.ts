import type { TransactionsResponse } from './types';

export async function fetchTransactions(days: number, terminal: string): Promise<TransactionsResponse> {
  const res = await fetch(`/api/transactions?days=${days}&terminal=${terminal}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function fetchTerminals(): Promise<string[]> {
  const res = await fetch('/api/terminals');
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data = await res.json();
  return data.terminals;
}
