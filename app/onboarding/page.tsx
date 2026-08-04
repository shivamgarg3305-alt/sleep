import { auth } from "@/auth";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getUserProfile } from "@/app/actions/profile";

export default async function OnboardingPage() {
  await auth();

  const profileResult = await getUserProfile();
  const profile = profileResult.success ? profileResult.data : null;

  return (
    <OnboardingWizard
      initial={{
        biologicalSex: profile?.biologicalSex ?? null,
        heightCm: profile?.heightCm ?? null,
        weightKg: profile?.weightKg ?? null,
        dateOfBirth: profile?.dateOfBirth ?? null,
      }}
    />
  );
}
