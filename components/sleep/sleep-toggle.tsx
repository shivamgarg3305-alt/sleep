"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Moon, Sunrise } from "lucide-react";

import { cn } from "@/lib/utils";

import { useElapsedTime } from "./use-elapsed-time";

interface SleepToggleProps {
  phase: "awake" | "sleeping";
  startTime: Date | null;
  pending: boolean;
  onToggle: () => void;
}

/**
 * The dashboard's centerpiece. A single massive circular button that is the
 * entire interaction model: tap to go to sleep, tap again to wake up.
 *
 * - Awake: static glow, "Going to Sleep", moon icon.
 * - Sleeping: slow breathing ring pulsing behind the button, live elapsed
 *   timer, "Wake Up", sunrise icon. The screen-dimming overlay lives one
 *   level up in <SleepDashboard>, since it needs to affect the whole page.
 */
export function SleepToggle({
  phase,
  startTime,
  pending,
  onToggle,
}: SleepToggleProps) {
  const isSleeping = phase === "sleeping";
  const elapsed = useElapsedTime(isSleeping ? startTime : null);

  return (
    <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
      {/* Breathing ring — only present while sleeping */}
      <AnimatePresence>
        {isSleeping && (
          <motion.div
            key="breathing-ring"
            aria-hidden
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.14, 1] }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{
              opacity: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute inset-0 rounded-full bg-primary/25 blur-2xl"
          />
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={onToggle}
        disabled={pending}
        whileTap={pending ? undefined : { scale: 0.93 }}
        whileHover={pending ? undefined : { scale: 1.015 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        aria-label={isSleeping ? "Wake up" : "Start sleep session"}
        className={cn(
          "relative z-10 flex h-64 w-64 flex-col items-center justify-center gap-3 rounded-full border transition-[background,box-shadow] duration-700 sm:h-72 sm:w-72",
          "disabled:cursor-not-allowed disabled:opacity-90",
          isSleeping
            ? "border-primary/30 bg-gradient-to-b from-secondary to-oled-950 shadow-glow-lg"
            : "border-white/10 bg-gradient-to-b from-secondary to-oled-900 shadow-glow-md hover:shadow-glow-lg"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {pending ? (
            <motion.div
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <Loader2 className="h-9 w-9 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                {isSleeping ? "Waking up…" : "Starting…"}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-3"
            >
              {isSleeping ? (
                <Sunrise className="h-9 w-9 text-primary" strokeWidth={1.5} />
              ) : (
                <Moon className="h-9 w-9 text-primary" strokeWidth={1.5} />
              )}
              <span className="text-lg font-medium tracking-tight text-glow">
                {isSleeping ? "Wake Up" : "Going to Sleep"}
              </span>
              {isSleeping && (
                <span className="text-sm tabular-nums text-muted-foreground">
                  {elapsed}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
