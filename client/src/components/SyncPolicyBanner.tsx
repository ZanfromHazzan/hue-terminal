export function SyncPolicyBanner() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200">
      <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.65 6.35A8 8 0 1019.5 13M19.5 13H15M19.5 13V8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p>
        <strong>Sync policy:</strong> every <strong>15 min</strong>, or immediately once a terminal buffers{' '}
        <strong>50 records</strong> — whichever comes first. Failed syncs retry with exponential backoff (max 5
        min). Records are deleted locally only after a confirmed HTTP 200.
      </p>
    </div>
  );
}
