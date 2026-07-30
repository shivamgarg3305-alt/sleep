import type { SleepSession } from "@prisma/client";

import { StatsCards } from "./stats-cards";
import { SleepChart } from "./sleep-chart";

interface AnalyticsSectionProps {
  mostRecent: SleepSession | null;
  averageDurationMin: number;
  sessions: SleepSession[];
}

/**
 * Server component — no hooks of its own, just composes two client
 * components (StatsCards, SleepChart). Kept server-side so this file adds
 * zero extra client JS on its own.
 */
export function AnalyticsSection({
  mostRecent,
  averageDurationMin,
  sessions,
}: AnalyticsSectionProps) {
  return (
    <div className="w-full max-w-md">
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">
        Insights
      </h2>
      <StatsCards mostRecent={mostRecent} averageDurationMin={averageDurationMin} />
      <div className="glass-panel mt-3 rounded-2xl p-4">
        <p className="mb-2 text-xs text-muted-foreground">Last 7 days</p>
        <SleepChart sessions={sessions} />
      </div>
    </div>
  );
}
