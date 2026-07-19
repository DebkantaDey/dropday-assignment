import { PlugZap, PackageSearch } from "lucide-react";

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-[320px] animate-pulse rounded-2xl border border-line bg-surface" />
      ))}
    </div>
  );
}

export function GridError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-danger/25 bg-danger-ink px-6 py-16 text-center">
      <PlugZap className="text-danger" size={28} strokeWidth={1.5} />
      <p className="font-display text-lg text-ink">The feed dropped the connection</p>
      <p className="max-w-sm text-sm text-muted">{message}</p>
      <button
        onClick={onRetry}
        className="focus-ring mt-2 rounded-lg bg-danger px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:bg-danger/90"
      >
        Retry
      </button>
    </div>
  );
}

export function GridEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-6 py-16 text-center">
      <PackageSearch className="text-muted" size={28} strokeWidth={1.5} />
      <p className="font-display text-lg text-ink">Nothing&apos;s dropping right now</p>
      <p className="max-w-sm text-sm text-muted">Check back soon — new products are scheduled throughout the day.</p>
    </div>
  );
}
