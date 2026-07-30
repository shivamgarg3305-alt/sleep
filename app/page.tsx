import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LandingHero } from "@/components/landing-hero";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    // Suspense boundary required because LandingHero reads useSearchParams()
    <Suspense fallback={null}>
      <LandingHero />
    </Suspense>
  );
}
