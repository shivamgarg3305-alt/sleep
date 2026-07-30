"use client";

import { useEffect, useState } from "react";

import { formatDuration } from "@/lib/utils";

/**
 * Ticks once a second while `startTime` is non-null, returning a friendly
 * elapsed-time string ("Just now", "12m", "7h 42m"). Returns "0m" and does
 * nothing when startTime is null (awake state) — cheap no-op, no interval.
 */
export function useElapsedTime(startTime: Date | null): string {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!startTime) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startTime]);

  if (!startTime) return "0m";

  const elapsedMinutes = Math.max(
    0,
    Math.floor((now - startTime.getTime()) / 60_000)
  );

  return elapsedMinutes < 1 ? "Just now" : formatDuration(elapsedMinutes);
}
