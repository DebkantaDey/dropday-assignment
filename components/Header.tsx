import { Ticket } from "lucide-react";

export function Header() {
  return (
    <header className="mb-8 flex items-center justify-between border-b border-line pb-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white">
          <Ticket size={20} strokeWidth={1.75} />
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-live">Flash drop · live now</p>
          <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">Drop Day</h1>
        </div>
      </div>
      <p className="hidden max-w-[240px] text-right text-xs leading-relaxed text-muted sm:block">
        Adding an item holds it for 60 seconds. It isn't yours until checkout clears.
      </p>
    </header>
  );
}
