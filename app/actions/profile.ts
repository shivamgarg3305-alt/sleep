"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { User } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { actionError, type ActionResult } from "@/lib/action-result";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHENTICATED");
  }
  return session.user.id;
}

export async function getUserProfile(): Promise<ActionResult<User>> {
  try {
    const userId = await requireUserId();
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return { success: true, data: user };
  } catch (err) {
    return actionError(err);
  }
}

const onboardingSchema = z.object({
  biologicalSex: z.enum(["female", "male"]),
  heightCm: z.number().int().min(50).max(272),
  weightKg: z.number().min(20).max(300),
  dateOfBirth: z.coerce.date(),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;

export async function saveOnboardingProfile(
  input: OnboardingInput
): Promise<ActionResult<User>> {
  try {
    const userId = await requireUserId();
    const data = onboardingSchema.parse(input);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { ...data, onboardedAt: new Date() },
    });

    revalidatePath("/dashboard");
    return { success: true, data: updated };
  } catch (err) {
    return actionError(err);
  }
}

export async function skipOnboarding(): Promise<ActionResult<User>> {
  try {
    const userId = await requireUserId();
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { onboardedAt: new Date() },
    });
    revalidatePath("/dashboard");
    return { success: true, data: updated };
  } catch (err) {
    return actionError(err);
  }
}
