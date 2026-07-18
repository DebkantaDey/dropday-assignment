"use client";
import { Clock } from "lucide-react";
import { useCountdown } from "@/lib/useCountdown";

function format(ms: number) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function CountdownChip({ dropAt }: { dropAt: string }) {
  const { msLeft, done } = useCountdown(dropAt);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-soon px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
      <Clock size={11} />
      {done ? "dropping now" : format(msLeft)}
    </span>
  );
}
