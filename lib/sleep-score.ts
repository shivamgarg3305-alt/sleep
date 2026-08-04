import type { SleepSession } from "@prisma/client";

export interface SleepScoreInputs {
  sessions: Pick<SleepSession, "durationMin" | "quality" | "endTime">[];
  dateOfBirth: Date | null;
}

export interface SleepScoreResult {
  score: number;
  label: "Excellent" | "Good" | "Fair" | "Poor" | "No Data";
  color: string;
  breakdown: {
    durationScore: number;
    consistencyScore: number;
    qualityScore: number;
  };
}

function getAge(dob: Date | null): number | null {
  if (!dob) return null;
  const ms = Date.now() - dob.getTime();
  return Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000));
}

function recommendedRangeMinutes(age: number | null): [number, number] {
  if (age === null) return [7 * 60, 9 * 60];
  if (age < 18) return [8 * 60, 10 * 60];
  if (age < 65) return [7 * 60, 9 * 60];
  return [7 * 60, 8 * 60];
}

export function computeSleepScore({
  sessions,
  dateOfBirth,
}: SleepScoreInputs): SleepScoreResult {
  const completed = sessions.filter(
    (s) => s.endTime !== null && s.durationMin !== null
  );

  if (completed.length === 0) {
    return {
      score: 0,
      label: "No Data",
      color: "#6b7280",
      breakdown: { durationScore: 0, consistencyScore: 0, qualityScore: 0 },
    };
  }

  const [minRec, maxRec] = recommendedRangeMinutes(getAge(dateOfBirth));

  const durations = completed.map((s) => s.durationMin as number);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

  const durationScore =
    avgDuration >= minRec && avgDuration <= maxRec
      ? 100
      : Math.max(
          0,
          100 -
            (avgDuration < minRec ? minRec - avgDuration : avgDuration - maxRec) *
              1.5
        );

  const variance =
    durations.reduce((sum, d) => sum + (d - avgDuration) ** 2, 0) /
    durations.length;
  const stdDevMinutes = Math.sqrt(variance);
  const consistencyScore = Math.max(0, 100 - stdDevMinutes);

  const rated = completed.filter((s) => s.quality !== null);
  const qualityScore =
    rated.length > 0
      ? (rated.reduce((sum, s) => sum + (s.quality as number), 0) /
          rated.length /
          5) *
        100
      : durationScore;

  const score = Math.round(
    durationScore * 0.5 + consistencyScore * 0.25 + qualityScore * 0.25
  );
  const clamped = Math.min(100, Math.max(0, score));

  let label: SleepScoreResult["label"];
  let color: string;
  if (clamped >= 85) {
    label = "Excellent";
    color = "#34d399";
  } else if (clamped >= 70) {
    label = "Good";
    color = "#6366f1";
  } else if (clamped >= 50) {
    label = "Fair";
    color = "#fbbf24";
  } else {
    label = "Poor";
    color = "#f87171";
  }

  return {
    score: clamped,
    label,
    color,
    breakdown: {
      durationScore: Math.round(durationScore),
      consistencyScore: Math.round(consistencyScore),
      qualityScore: Math.round(qualityScore),
    },
  };
}
