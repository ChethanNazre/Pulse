export function CardSkeleton() {
  return (
    <div className="flex animate-pulse gap-4 border-b border-line py-5" aria-hidden>
      <div className="hidden h-24 w-32 shrink-0 rounded bg-fg/10 sm:block" />
      <div className="flex-1 space-y-3">
        <div className="h-3 w-1/4 rounded bg-fg/10" />
        <div className="h-5 w-3/4 rounded bg-fg/10" />
        <div className="h-3 w-full rounded bg-fg/10" />
      </div>
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-6 text-sm text-muted">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent" />
      {label}
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="panel px-6 py-12" data-testid="empty-state">
      <p className="text-xl font-semibold">{title}</p>
      {hint && <p className="mt-1 max-w-md text-sm text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
