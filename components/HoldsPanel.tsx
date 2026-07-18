"use client";
import { ClipboardList } from "lucide-react";
import { useDropDayStore } from "@/lib/store";
import { HoldTicket } from "@/components/HoldTicket";

const EXPIRED_GRACE_MS = 6000;

export function HoldsPanel({ onCheckout }: { onCheckout: () => void }) {
  const holds = useDropDayStore((s) => s.holds);
  const releaseHold = useDropDayStore((s) => s.releaseHold);

  const now = Date.now();
  const visible = holds.filter((h) => {
    if (h.status === "active") return true;
    if (h.status === "expired") return now - new Date(h.expiresAt).getTime() < EXPIRED_GRACE_MS;
    return false;
  });

  const activeHolds = visible.filter((h) => h.status === "active");
  const total = activeHolds.reduce((sum, h) => sum + h.price * h.quantity, 0);

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-medium text-ink">Your holds</h2>
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
          {activeHolds.length} active · 60s each
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <ClipboardList className="text-muted" size={22} strokeWidth={1.5} />
          <p className="text-sm text-ink">No holds yet</p>
          <p className="max-w-[220px] text-xs text-muted">
            Hold a live item to reserve it for 60 seconds while you check out.
          </p>
        </div>
      ) : (
        <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
          {visible.map((h) => (
            <HoldTicket key={h.id} hold={h} onRelease={releaseHold} />
          ))}
        </ul>
      )}

      <div className="mt-4 border-t border-line pt-3">
        <div className="mb-3 flex items-center justify-between font-mono text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="font-semibold text-ink">${total}</span>
        </div>
        <button
          disabled={activeHolds.length === 0}
          onClick={onCheckout}
          className="focus-ring w-full rounded-lg bg-ink py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-live disabled:cursor-not-allowed disabled:opacity-30"
        >
          Checkout
        </button>
      </div>
    </aside>
  );
}
