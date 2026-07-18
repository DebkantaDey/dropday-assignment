import clsx from "clsx";

export function StockGauge({
  available,
  total,
  accent,
}: {
  available: number;
  total: number;
  accent: string;
}) {
  const ratio = total > 0 ? available / total : 0;
  const critical = total > 0 && ratio <= 0.2;
  const color = available === 0 ? "#9AA0AA" : critical ? "#C22B1D" : accent;

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between">
        <span className={clsx("font-mono text-[13px] font-semibold tabular-nums", critical ? "text-danger" : "text-ink")}>
          {available.toString().padStart(2, "0")}
        </span>
        <span className="font-mono text-[10px] text-muted">of {total} in stock</span>
      </div>
      <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-line">
        <div
          className={clsx("h-full rounded-full transition-all duration-500", critical && "animate-pulseRing")}
          style={{ width: `${Math.max(ratio, available > 0 ? 0.04 : 0) * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
