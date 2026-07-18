"use client";
import clsx from "clsx";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useDropDayStore, Notice } from "@/lib/store";

const ICONS: Record<Notice["tone"], typeof Info> = {
  danger: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export function NoticeStack() {
  const notices = useDropDayStore((s) => s.notices);
  const dismiss = useDropDayStore((s) => s.dismissNotice);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      {notices.map((n) => {
        const Icon = ICONS[n.tone];
        return (
          <div
            key={n.id}
            role="status"
            className={clsx(
              "animate-rise pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-lg border bg-surface px-4 py-2.5 font-mono text-xs shadow-card",
              n.tone === "danger" && "border-danger/30 text-danger",
              n.tone === "success" && "border-live/30 text-live",
              n.tone === "info" && "border-soon/30 text-soon"
            )}
          >
            <Icon size={14} className="shrink-0" />
            <span className="flex-1 text-ink">{n.message}</span>
            <button onClick={() => dismiss(n.id)} className="focus-ring shrink-0 text-muted hover:text-ink">
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
