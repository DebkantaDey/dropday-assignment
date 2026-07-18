"use client";
import { useState } from "react";
import clsx from "clsx";
import { Radio, Eye, Ban, ImageOff } from "lucide-react";
import { Product } from "@/lib/types";
import { StockGauge } from "@/components/StockBar";
import { CountdownChip } from "@/components/CountdownChip";

export function ProductCard({
  product,
  onHold,
  isPending,
}: {
  product: Product;
  onHold: (id: string) => void;
  isPending: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const isLive = product.status === "live";
  const isSoon = product.status === "dropping_soon";
  const isSoldOut = product.status === "sold_out";
  const lowStock = isLive && product.availableStock > 0 && product.availableStock / product.totalStock <= 0.2;

  return (
    <article
      className={clsx(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-surface shadow-card transition-all duration-200",
        isSoldOut ? "border-line opacity-70" : "border-line hover:-translate-y-0.5 hover:shadow-lg"
      )}
    >
      {/* punched tag hole + string, top-left */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 h-4 w-4 rounded-full border-2 border-line bg-paper" />
      <svg className="pointer-events-none absolute left-[26px] top-[15px] z-10" width="18" height="14" viewBox="0 0 18 14" fill="none">
        <path d="M1 1c4 1 4 11 16 11" stroke={isSoldOut ? "#9AA0AA" : product.accent} strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface2">
        {!imgFailed ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className={clsx(
              "h-full w-full object-cover transition-transform duration-500",
              !isSoldOut && "group-hover:scale-[1.04]",
              isSoldOut && "grayscale"
            )}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted">
            <ImageOff size={22} strokeWidth={1.5} />
            <span className="font-mono text-[10px]">no photo</span>
          </div>
        )}

        <div className="absolute left-3 top-3">
          {isLive && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-live px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
              <Radio size={11} className="animate-pulseRing" />
              Live
            </span>
          )}
          {isSoon && product.dropAt && <CountdownChip dropAt={product.dropAt} />}
          {isSoldOut && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-sold shadow-sm">
              <Ban size={11} />
              Sold out
            </span>
          )}
        </div>

        {!isSoldOut && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink/75 px-2 py-1 font-mono text-[10px] text-white backdrop-blur-sm">
            <Eye size={11} />
            {product.watchers}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 pt-3">
        <div>
          <h3 className="font-display text-lg font-medium leading-tight text-ink">{product.name}</h3>
          <p className="mt-1 text-sm text-muted">{product.blurb}</p>
        </div>

        {isLive && <StockGauge available={product.availableStock} total={product.totalStock} accent={product.accent} />}
        {isSoldOut && <StockGauge available={0} total={product.totalStock} accent={product.accent} />}
        {isSoon && (
          <p className="font-mono text-[11px] text-muted">{product.totalStock} units queued for this drop</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="font-display text-base font-medium text-ink">${product.price}</span>

          <button
            type="button"
            disabled={!isLive || isPending}
            onClick={() => onHold(product.id)}
            className={clsx(
              "focus-ring rounded-lg px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-wide transition-colors",
              isLive
                ? "bg-ink text-white hover:bg-live disabled:opacity-50"
                : "cursor-not-allowed bg-surface2 text-muted"
            )}
          >
            {isPending ? "Holding…" : isLive ? (lowStock ? "Grab it — low stock" : "Hold for 60s") : isSoon ? "Notify me" : "Gone"}
          </button>
        </div>
      </div>
    </article>
  );
}
