"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { SleepSession } from "@prisma/client";

import { startSleep, wakeUp } from "@/app/actions/sleep";
import { formatDuration } from "@/lib/utils";

import { SleepToggle } from "./sleep-toggle";
import { RatingDialog } from "./rating-dialog";

interface SleepDashboardProps {
  /**
   * The user's in-progress session, if any, fetched server-side in
   * app/dashboard/page.tsx. React Server Components serialize Date fields
   * natively, so `startTime` arrives here as a real Date instance — no
   * manual parsing needed.
   */
  initialActiveSession: SleepSession | null;
}

interface RatingTarget {
  sessionId: string;
  durationMin: number | null;
}

export function SleepDashboard({ initialActiveSession }: SleepDashboardProps) {
  const [activeSession, setActiveSession] = useState(initialActiveSession);
  const [ratingTarget, setRatingTarget] = useState<RatingTarget | null>(null);
  const [isPending, startTransition] = useTransition();

  const phase: "awake" | "sleeping" = activeSession ? "sleeping" : "awake";

  function buzz() {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(12);
    }
  }

  function handleToggle() {
    if (isPending) return;
    buzz();

    if (phase === "awake") {
      startTransition(async () => {
        const result = await startSleep();
        if (result.success) {
          setActiveSession(result.data);
          toast.success("Sleep session started. Good night.");
        } else {
          toast.error(result.error);
        }
      });
      return;
    }

    // phase === "sleeping"
    if (!activeSession) return;
    const sessionId = activeSession.id;

    startTransition(async () => {
      const result = await wakeUp({ sessionId });
      if (result.success) {
        setActiveSession(null);
        setRatingTarget({
          sessionId: result.data.id,
          durationMin: result.data.durationMin,
        });
        toast.success(
          result.data.durationMin !== null
            ? `You slept ${formatDuration(result.data.durationMin)}.`
            : "Sleep session ended."
        );
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* Screen-dimming overlay — deepens the OLED black further while asleep */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-black"
        initial={false}
        animate={{ opacity: phase === "sleeping" ? 0.55 : 0 }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <SleepToggle
          phase={phase}
          startTime={activeSession?.startTime ?? null}
          pending={isPending}
          onToggle={handleToggle}
        />
      </div>

      <RatingDialog
        open={ratingTarget !== null}
        sessionId={ratingTarget?.sessionId ?? null}
        durationMin={ratingTarget?.durationMin ?? null}
        onDone={() => setRatingTarget(null)}
      />
    </div>
  );
}
