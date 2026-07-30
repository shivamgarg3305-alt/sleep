"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { rateSleepSession } from "@/app/actions/sleep";
import { formatDuration } from "@/lib/utils";

interface RatingDialogProps {
  open: boolean;
  sessionId: string | null;
  durationMin: number | null;
  onDone: () => void;
}

/**
 * Shown immediately after "Wake Up" is tapped. Deliberately non-blocking to
 * the rest of the app — the sleep session is already saved by this point
 * (wakeUp() already ran); this only attaches the optional 1-5 quality
 * rating, so "Skip" is always a safe, complete action.
 */
export function RatingDialog({
  open,
  sessionId,
  durationMin,
  onDone,
}: RatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setRating(0);
    setHovered(0);
  }

  function handleSkip() {
    reset();
    onDone();
  }

  function handleSubmit() {
    if (!sessionId || rating === 0) return;
    startTransition(async () => {
      const result = await rateSleepSession({ sessionId, quality: rating });
      if (result.success) {
        toast.success("Thanks — rating saved.");
        reset();
        onDone();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleSkip();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {durationMin !== null
              ? `You slept ${formatDuration(durationMin)}`
              : "Sleep session saved"}
          </DialogTitle>
          <DialogDescription>How do you feel?</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-1.5 py-6">
          {[1, 2, 3, 4, 5].map((value) => {
            const filled = value <= (hovered || rating);
            return (
              <motion.button
                key={value}
                type="button"
                whileTap={{ scale: 0.82 }}
                onMouseEnter={() => setHovered(value)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(value)}
                className="p-1"
                aria-label={`${value} star${value > 1 ? "s" : ""}`}
              >
                <Star
                  className={cnStar(filled)}
                  strokeWidth={1.5}
                />
              </motion.button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleSkip} disabled={isPending}>
            Skip
          </Button>
          <Button
            variant="glow"
            onClick={handleSubmit}
            disabled={rating === 0 || isPending}
          >
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function cnStar(filled: boolean) {
  return filled
    ? "h-8 w-8 fill-primary text-primary transition-colors"
    : "h-8 w-8 text-muted-foreground transition-colors";
}
