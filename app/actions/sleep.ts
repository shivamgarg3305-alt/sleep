"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { SleepSession } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { actionError, type ActionResult } from "@/lib/action-result";

/** Resolves the current user's id or throws a sentinel the callers catch. */
async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHENTICATED");
  }
  return session.user.id;
}

/**
 * Returns the caller's in-progress sleep session (endTime === null), if any.
 * The dashboard uses this on load to decide whether to render the
 * "Going to Sleep" or "Wake Up" state of the one-tap toggle.
 */
export async function getActiveSleepSession(): Promise<
  ActionResult<SleepSession | null>
> {
  try {
    const userId = await requireUserId();
    const active = await prisma.sleepSession.findFirst({
      where: { userId, endTime: null },
      orderBy: { startTime: "desc" },
    });
    return { success: true, data: active };
  } catch (err) {
    return actionError(err);
  }
}

/**
 * Starts a new sleep session for the current user ("Going to Sleep" tap).
 * Guards against double-starts (e.g. a duplicate request from a flaky
 * connection) by refusing to create a second concurrently-active session.
 */
export async function startSleep(): Promise<ActionResult<SleepSession>> {
  try {
    const userId = await requireUserId();

    const existingActive = await prisma.sleepSession.findFirst({
      where: { userId, endTime: null },
    });
    if (existingActive) {
      return {
        success: false,
        error: "You already have a sleep session in progress.",
      };
    }

    const created = await prisma.sleepSession.create({
      data: { userId, startTime: new Date() },
    });

    revalidatePath("/dashboard");
    return { success: true, data: created };
  } catch (err) {
    return actionError(err);
  }
}

const wakeUpInput = z.object({
  sessionId: z.string().min(1),
  /** Optional — the UI can end the session first, then rate it separately. */
  quality: z.number().int().min(1).max(5).optional(),
});
export type WakeUpInput = z.infer<typeof wakeUpInput>;

/**
 * Ends an in-progress sleep session ("Wake Up" tap): stamps endTime,
 * computes durationMin, and optionally stores the 1-5 quality rating in the
 * same call if the UI collects it inline.
 */
export async function wakeUp(
  input: WakeUpInput
): Promise<ActionResult<SleepSession>> {
  try {
    const userId = await requireUserId();
    const { sessionId, quality } = wakeUpInput.parse(input);

    const existing = await prisma.sleepSession.findUnique({
      where: { id: sessionId },
    });

    if (!existing || existing.userId !== userId) {
      return { success: false, error: "Sleep session not found." };
    }
    if (existing.endTime) {
      return { success: false, error: "This session has already ended." };
    }

    const endTime = new Date();
    const durationMin = Math.max(
      0,
      Math.round((endTime.getTime() - existing.startTime.getTime()) / 60_000)
    );

    const updated = await prisma.sleepSession.update({
      where: { id: sessionId },
      data: { endTime, durationMin, quality },
    });

    revalidatePath("/dashboard");
    return { success: true, data: updated };
  } catch (err) {
    return actionError(err);
  }
}

const rateInput = z.object({
  sessionId: z.string().min(1),
  quality: z.number().int().min(1).max(5),
});

/**
 * Attaches a "how do you feel?" rating to an already-ended session. Kept
 * separate from wakeUp() so the UI can end the session instantly for a snappy
 * feel, then show the star-rating prompt as a non-blocking follow-up.
 */
export async function rateSleepSession(
  input: z.infer<typeof rateInput>
): Promise<ActionResult<SleepSession>> {
  try {
    const userId = await requireUserId();
    const { sessionId, quality } = rateInput.parse(input);

    const existing = await prisma.sleepSession.findUnique({
      where: { id: sessionId },
    });
    if (!existing || existing.userId !== userId) {
      return { success: false, error: "Sleep session not found." };
    }

    const updated = await prisma.sleepSession.update({
      where: { id: sessionId },
      data: { quality },
    });

    revalidatePath("/dashboard");
    return { success: true, data: updated };
  } catch (err) {
    return actionError(err);
  }
}

/**
 * Completed sessions in the last `days` days, ascending by start time —
 * exactly the shape Recharts wants for the 7-day bar chart in Phase 5.
 */
export async function getRecentSleepSessions(
  days = 7
): Promise<ActionResult<SleepSession[]>> {
  try {
    const userId = await requireUserId();
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const sessions = await prisma.sleepSession.findMany({
      where: { userId, endTime: { not: null }, startTime: { gte: since } },
      orderBy: { startTime: "asc" },
    });

    return { success: true, data: sessions };
  } catch (err) {
    return actionError(err);
  }
}

/**
 * Single round-trip bundle for the dashboard: most recent completed session
 * + the last `days` days of sessions + the average duration across them.
 * Avoids the client waterfalling three separate Server Action calls.
 */
export async function getSleepStats(days = 7): Promise<
  ActionResult<{
    mostRecent: SleepSession | null;
    sessions: SleepSession[];
    averageDurationMin: number;
  }>
> {
  try {
    const userId = await requireUserId();
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const [mostRecent, sessions] = await Promise.all([
      prisma.sleepSession.findFirst({
        where: { userId, endTime: { not: null } },
        orderBy: { endTime: "desc" },
      }),
      prisma.sleepSession.findMany({
        where: { userId, endTime: { not: null }, startTime: { gte: since } },
        orderBy: { startTime: "asc" },
      }),
    ]);

    const durations = sessions
      .map((s) => s.durationMin)
      .filter((m): m is number => m !== null);
    const averageDurationMin =
      durations.length === 0
        ? 0
        : Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);

    return {
      success: true,
      data: { mostRecent, sessions, averageDurationMin },
    };
  } catch (err) {
    return actionError(err);
  }
}
