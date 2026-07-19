"use client";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useDropDayStore } from "@/lib/store";

export function CheckoutModal() {
  const stage = useDropDayStore((s) => s.checkoutStage);
  const holds = useDropDayStore((s) => s.holds);
  const error = useDropDayStore((s) => s.checkoutError);
  const expiredIds = useDropDayStore((s) => s.expiredDuringCheckout);
  const order = useDropDayStore((s) => s.lastOrder);
  const confirmCheckout = useDropDayStore((s) => s.confirmCheckout);
  const closeCheckout = useDropDayStore((s) => s.closeCheckout);

  if (stage === "idle") return null;

  const activeHolds = holds.filter((h) => h.status === "active");
  const total = activeHolds.reduce((sum, h) => sum + h.price * h.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl border border-line bg-surface p-5 shadow-card sm:rounded-2xl animate-rise">
        {stage === "summary" && (
          <>
            <h2 className="font-display text-lg text-ink">Confirm your order</h2>
            <p className="mt-1 text-xs text-muted">
              No payment is collected. This is a mock checkout for the drop simulation.
            </p>
            <ul className="my-4 max-h-56 space-y-2 overflow-y-auto">
              {activeHolds.map((h) => (
                <li key={h.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink">
                    {h.productName} <span className="text-muted">×{h.quantity}</span>
                  </span>
                  <span className="font-mono text-muted">${h.price * h.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="mb-4 flex items-center justify-between border-t border-line pt-3 font-mono text-sm">
              <span className="text-muted">Total</span>
              <span className="font-semibold text-ink">${total}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={closeCheckout}
                className="focus-ring flex-1 rounded-lg border border-line py-2.5 font-mono text-xs uppercase tracking-wide text-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={confirmCheckout}
                className="focus-ring flex-1 rounded-lg bg-ink py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:bg-live"
              >
                Confirm order
              </button>
            </div>
          </>
        )}

        {stage === "processing" && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Loader2 className="animate-spin text-live" size={28} />
            <p className="text-sm text-ink">Placing your order…</p>
          </div>
        )}

        {stage === "success" && order && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="text-live" size={40} strokeWidth={1.5} />
            <h2 className="font-display text-lg text-ink">Order confirmed</h2>
            <p className="font-mono text-xs text-muted">Order {order.id}</p>
            <ul className="mt-2 w-full space-y-1">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-ink">
                    {it.productName} ×{it.quantity}
                  </span>
                  <span className="font-mono text-muted">${it.price * it.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 w-full border-t border-line pt-3 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Total</span>
                <span className="font-semibold text-ink">${order.total}</span>
              </div>
            </div>
            <button
              onClick={closeCheckout}
              className="focus-ring mt-3 w-full rounded-lg bg-ink py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:bg-live"
            >
              Done
            </button>
          </div>
        )}

        {stage === "failed" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <AlertTriangle className="text-danger" size={36} strokeWidth={1.5} />
            <h2 className="font-display text-lg text-ink">Checkout didn&apos;t go through</h2>
            <p className="max-w-xs text-sm text-muted">{error}</p>
            {expiredIds.length > 0 && (
              <p className="max-w-xs text-xs text-muted">
                {expiredIds.length} hold{expiredIds.length > 1 ? "s" : ""} timed out mid-checkout and returned to
                the pool. Nothing was charged.
              </p>
            )}
            <div className="mt-2 flex w-full gap-2">
              <button
                onClick={closeCheckout}
                className="focus-ring flex-1 rounded-lg border border-line py-2.5 font-mono text-xs uppercase tracking-wide text-muted hover:text-ink"
              >
                Back to holds
              </button>
              <button
                onClick={confirmCheckout}
                className="focus-ring flex-1 rounded-lg bg-ink py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-white hover:bg-live"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
