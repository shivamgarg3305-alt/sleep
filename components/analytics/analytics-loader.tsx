import { getSleepStats } from "@/app/actions/sleep";

import { AnalyticsSection } from "./analytics-section";

/**
 * Isolated as its own async component (rather than fetched inline in
 * DashboardPage) so it can be wrapped in <Suspense> — the sleep toggle
 * paints immediately, this streams in a beat later behind a skeleton.
 */
export async function AnalyticsLoader() {
  const result = await getSleepStats(7);

  if (!result.success) {
    return (
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 text-center text-sm text-destructive">
        Couldn&apos;t load insights: {result.error}
      </div>
    );
  }

  return (
    <AnalyticsSection
      mostRecent={result.data.mostRecent}
      averageDurationMin={result.data.averageDurationMin}
      sessions={result.data.sessions}
    />
  );
}
