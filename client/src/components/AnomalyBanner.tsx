interface Props {
  count: number;
}

export function AnomalyBanner({ count }: Props) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
      <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A1 1 0 0 0 3 19.5h18a1 1 0 0 0 .89-1.46L13.71 3.86a1 1 0 0 0-1.72 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {count} day{count > 1 ? 's' : ''} flagged with abnormal success/error rates in this window.
    </div>
  );
}
