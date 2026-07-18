"use client";
import { useEffect, useState } from "react";

/**
 * Ticks down to `targetIso` for display purposes only. This is a projection,
 * not the source of truth — the server enforces real expiry independently,
 * and the client resyncs via polling, so any clock drift self-corrects
 * within a few seconds instead of accumulating.
 */
export function useCountdown(targetIso: string | null) {
  const [msLeft, setMsLeft] = useState<number>(() =>
    targetIso ? new Date(targetIso).getTime() - Date.now() : 0
  );

  useEffect(() => {
    if (!targetIso) return;
    const update = () => setMsLeft(new Date(targetIso).getTime() - Date.now());
    update();
    const id = setInterval(update, 200);
    return () => clearInterval(id);
  }, [targetIso]);

  const clamped = Math.max(0, msLeft);
  return {
    msLeft: clamped,
    seconds: Math.ceil(clamped / 1000),
    done: clamped <= 0,
  };
}
