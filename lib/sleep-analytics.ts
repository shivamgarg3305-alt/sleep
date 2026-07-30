import { format, isSameDay, startOfDay, subDays } from "date-fns";

export interface DailySleepDatum {
  date: Date;
  label: string;
  minutes: number;
}

/**
 * Buckets completed sessions into the last 7 calendar days (oldest first),
 * summing durationMin per day. A session is bucketed by the calendar date
 * it *started* on — the intuitive read for a sleep tracker ("Tuesday
 * night's sleep"), even though it may technically end after midnight.
 *
 * Days with no session still appear in the output with minutes: 0, so the
 * chart always renders a full 7-bar week rather than compressing around
 * whatever data happens to exist.
 */
export function buildLast7DaysSeries(
  sessions: { startTime: Date; durationMin: number | null }[]
): DailySleepDatum[] {
  const days: DailySleepDatum[] = [];

  for (let offset = 6; offset >= 0; offset--) {
    const day = startOfDay(subDays(new Date(), offset));
    const minutes = sessions
      .filter((s) => isSameDay(s.startTime, day))
      .reduce((sum, s) => sum + (s.durationMin ?? 0), 0);

    days.push({ date: day, label: format(day, "EEE"), minutes });
  }

  return days;
}
