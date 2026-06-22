interface Props {
  syncedAt: string | null;
}

export function Header({ syncedAt }: Props) {
  const syncedLabel = syncedAt
    ? new Date(syncedAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">OmniPay Terminal</h1>
          <p className="text-xs text-zinc-500">Transaction Dashboard</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-zinc-400">
        <span className="rounded-full bg-zinc-800 px-2.5 py-1 font-medium text-zinc-300">Internal</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Synced · {syncedLabel}
        </span>
      </div>
    </header>
  );
}
