import Link from "next/link";
import type { SleepSession } from "@prisma/client";

import type { SleepScoreResult } from "@/lib/sleep-score";

import { StatsCards } from "./stats-cards";
import { SleepChart } from "./sleep-chart";
import { SleepScoreRing } from "./sleep-score-ring";

interface AnalyticsSectionProps {
  mostRecent: SleepSession | null;
  averageDurationMin: number;
  sessions: SleepSession[];
  score: SleepScoreResult | null;
}

export function AnalyticsSection({
  mostRecent,
  averageDurationMin,
  sessions,
  score,
}: AnalyticsSectionProps) {
  return (
    <div className="w-full max-w-md">
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">
        Insights
      </h2>

      {score ? (
        <div className="mb-3">
          <SleepScoreRing
            score={score.score}
            label={score.label}
            color={score.color}
            breakdown={score.breakdown}
          />
        </div>
      ) : (
        <Link
          href="/onboarding"
          className="glass-panel mb-3 flex items-center justify-between rounded-2xl p-4 transition-colors hover:bg-white/[0.04]"
        >
          <div>
            <p className="text-sm font-medium">Add your profile</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              See your personalized Sleep Score
            </p>
          </div>
          <span className="text-primary">→</span>
        </Link>
      )}

      <StatsCards mostRecent={mostRecent} averageDurationMin={averageDurationMin} />
      <div className="glass-panel mt-3 rounded-2xl p-4">
        <p className="mb-2 text-xs text-muted-foreground">Last 7 days</p>
        <SleepChart sessions={sessions} />
      </div>
    </div>
  );
}
