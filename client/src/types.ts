export interface DayRow {
  date: string;
  terminal: string;
  attempts: number;
  upstream: number;
  successful: number;
  customerErrors: number;
  systemErrors: number;
  localOnly: number;
  successRatePct: number;
  upstreamRatePct: number;
  anomaly: boolean;
  anomalyMean: number;
}

export interface Summary {
  date: string;
  attempts: number;
  upstream: number;
  upstreamRatePct: number;
  successful: number;
  successRatePct: number;
  customerErrors: number;
  systemErrors: number;
  localOnly: number;
}

export interface TransactionsResponse {
  syncedAt: string;
  terminal: string;
  days: number;
  summary: Summary | null;
  rows: DayRow[];
  anomalyCount: number;
}

export type ErrorFilter = 'all' | 'customer' | 'system' | 'local';
export type SortKey = keyof Pick<
  DayRow,
  'date' | 'attempts' | 'successRatePct' | 'upstreamRatePct' | 'customerErrors' | 'systemErrors' | 'localOnly'
>;
