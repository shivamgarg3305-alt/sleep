"use client";

import { motion } from "framer-motion";
import { Moon, Star, TrendingUp } from "lucide-react";
import type { SleepSession } from "@prisma/client";

import { formatDuration } from "@/lib/utils";

interface StatsCardsProps {
  mostRecent: SleepSession | null;
  averageDurationMin: number;
}

export function StatsCards({ mostRecent, averageDurationMin }: StatsCardsProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-3">
      <StatCard
        icon={<Moon className="h-4 w-4 text-primary" />}
        label="Last Night"
        value={
          mostRecent?.durationMin != null
            ? formatDuration(mostRecent.durationMin)
            : "—"
        }
        sub={
          mostRecent?.quality ? <StarRow rating={mostRecent.quality} /> : undefined
        }
      />
      <StatCard
        icon={<TrendingUp className="h-4 w-4 text-primary" />}
        label="7-Day Average"
        value={averageDurationMin > 0 ? formatDuration(averageDurationMin) : "—"}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-panel flex flex-col gap-2 rounded-2xl p-4"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      {sub}
    </motion.div>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={
            value <= rating
              ? "h-3 w-3 fill-primary text-primary"
              : "h-3 w-3 text-muted-foreground/40"
          }
        />
      ))}
    </div>
  );
}
