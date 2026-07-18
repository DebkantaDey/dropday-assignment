"use client";
import clsx from "clsx";
import { X } from "lucide-react";
import { Hold } from "@/lib/types";
import { useCountdown } from "@/lib/useCountdown";
import { CountdownRing } from "@/components/CountdownRing";

const HOLD_MS = 60_000;

export function HoldTicket({ hold, onRelease }: { hold: Hold; onRelease: (id: string) => void }) {
  const { msLeft, seconds, done } = useCountdown(hold.status === "active" ? hold.expiresAt : null);
  const expired = hold.status === "expired" || (hold.status === "active" && done);
  const panic = hold.status === "active" && !done && seconds <= 10;
  const ratio = msLeft / HOLD_MS;

  return (
    <li
      className={clsx(
        "relative flex items-center gap-3 rounded-xl border bg-surface p-3 shadow-ticket transition-all animate-rise",
        expired ? "border-danger/40 bg-danger-ink" : panic ? "border-danger/50" : "border-line"
      )}
    >
      {/* ticket perforation */}
      <div className="absolute -left-[7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-surface2 border border-line" />
      <div className="absolute -right-[7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-surface2 border border-line" />

      <div className="shrink-0">
        {expired ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-danger/40 text-danger">
            <X size={16} />
          </div>
        ) : (
          <CountdownRing ratio={ratio} danger={panic} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">
          {hold.productName} <span className="text-muted">×{hold.quantity}</span>
        </p>
        {expired ? (
          <p className="text-xs text-danger">Hold expired — released back to the pool</p>
        ) : (
          <p className={clsx("font-mono text-xs", panic ? "text-danger" : "text-muted")}>
            {panic ? `${seconds}s — going fast` : `${seconds}s left`} · ${hold.price * hold.quantity}
          </p>
        )}
      </div>

      {!expired && (
        <button
          onClick={() => onRelease(hold.id)}
          className="focus-ring shrink-0 rounded-md border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-muted hover:border-danger/40 hover:text-danger"
        >
          Release
        </button>
      )}
    </li>
  );
}
