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
  failed: number;
}

export interface TransactionsResponse {
  syncedAt: string;
  terminal: string;
  days: number;
  summary: Summary | null;
  previousSummary: Summary | null;
  rows: DayRow[];
  priorRows: DayRow[] | null;
  anomalyCount: number;
}

export type ErrorFilter = 'all' | 'customer' | 'system' | 'local';
export type SortKey = keyof Pick<
  DayRow,
  'date' | 'attempts' | 'successRatePct' | 'upstreamRatePct' | 'customerErrors' | 'systemErrors' | 'localOnly'
>;

export type SeriesKey = 'attempts' | 'upstream' | 'successful' | 'customerErrors' | 'systemErrors' | 'localOnly';
export type ComparePeriod = 'none' | 'week' | 'month';

export interface FleetTerminal {
  id: string;
  city: string;
  store: string;
  status: 'online' | 'syncing' | 'retrying' | 'offline';
  buffered: number;
  lastSyncMinutesAgo: number;
  attempts: number;
  upstreamRatePct: number;
  valueNairaToday: number;
}

export interface FleetResponse {
  syncedAt: string;
  date: string;
  summary: {
    total: number;
    online: number;
    syncing: number;
    needsAttention: number;
    buffered: number;
  };
  terminals: FleetTerminal[];
}
