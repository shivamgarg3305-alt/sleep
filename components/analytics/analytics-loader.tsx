import { getSleepStats } from "@/app/actions/sleep";
import { getUserProfile } from "@/app/actions/profile";
import { computeSleepScore } from "@/lib/sleep-score";

import { AnalyticsSection } from "./analytics-section";

export async function AnalyticsLoader() {
  const [statsResult, profileResult] = await Promise.all([
    getSleepStats(7),
    getUserProfile(),
  ]);

  if (!statsResult.success) {
    return (
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 text-center text-sm text-destructive">
        Couldn&apos;t load insights: {statsResult.error}
      </div>
    );
  }

  const profile = profileResult.success ? profileResult.data : null;
  const hasProfile = Boolean(profile?.dateOfBirth && profile?.biologicalSex);

  const score = hasProfile
    ? computeSleepScore({
        sessions: statsResult.data.sessions,
        dateOfBirth: profile!.dateOfBirth,
      })
    : null;

  return (
    <AnalyticsSection
      mostRecent={statsResult.data.mostRecent}
      averageDurationMin={statsResult.data.averageDurationMin}
      sessions={statsResult.data.sessions}
      score={score}
    />
  );
}
