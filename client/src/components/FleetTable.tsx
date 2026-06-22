import type { FleetTerminal } from '../types';

const STATUS_STYLES: Record<FleetTerminal['status'], string> = {
  online: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  syncing: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  retrying: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  offline: 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400',
};

const STATUS_LABEL: Record<FleetTerminal['status'], string> = {
  online: 'Online',
  syncing: 'Syncing',
  retrying: 'Retrying',
  offline: 'Offline',
};

function nairaFormat(n: number) {
  return `₦${(n / 1_000_000).toFixed(2)}M`;
}

function lastSyncLabel(t: FleetTerminal) {
  if (t.status === 'syncing') return 'syncing now…';
  if (t.lastSyncMinutesAgo < 60) return `${t.lastSyncMinutesAgo} min ago`;
  return `${Math.floor(t.lastSyncMinutesAgo / 60)}h ${t.lastSyncMinutesAgo % 60}m ago`;
}

export function FleetTable({ terminals }: { terminals: FleetTerminal[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-white/10">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Terminal Fleet</h2>
        <p className="text-xs text-gray-400 dark:text-zinc-500">
          Live sync state per device · buffered records sync at 15 min / 50 records
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 dark:border-white/10 dark:text-zinc-500">
              <th className="px-4 py-2.5 font-medium">Terminal</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Buffered (unsynced)</th>
              <th className="px-4 py-2.5 font-medium">Last Sync</th>
              <th className="px-4 py-2.5 font-medium">Attempts</th>
              <th className="px-4 py-2.5 font-medium">Upstream</th>
              <th className="px-4 py-2.5 font-medium">Value Today</th>
            </tr>
          </thead>
          <tbody>
            {terminals.map((t) => (
              <tr key={t.id} className="border-b border-gray-100 last:border-0 dark:border-white/5">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-gray-900 dark:text-zinc-200">{t.id}</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">
                    {t.store} · {t.city}
                  </p>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[t.status]}`}>
                    {STATUS_LABEL[t.status]}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                      <div
                        className={`h-full rounded-full ${t.buffered >= 50 ? 'bg-rose-400' : 'bg-blue-400'}`}
                        style={{ width: `${Math.min(100, (t.buffered / 50) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-zinc-400">{t.buffered}/50</span>
                  </div>
                </td>
                <td
                  className={`px-4 py-2.5 text-xs ${
                    t.status === 'retrying' || t.status === 'offline'
                      ? 'text-rose-500 dark:text-rose-400'
                      : 'text-gray-500 dark:text-zinc-400'
                  }`}
                >
                  {lastSyncLabel(t)}
                </td>
                <td className="px-4 py-2.5 text-gray-700 dark:text-zinc-300">{t.attempts.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-gray-700 dark:text-zinc-300">{t.upstreamRatePct}%</td>
                <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-zinc-200">
                  {nairaFormat(t.valueNairaToday)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
