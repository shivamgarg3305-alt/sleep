import { Suspense } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";

import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { SleepDashboard } from "@/components/sleep/sleep-dashboard";
import { Sidebar } from "@/components/nav/sidebar";
import { BottomNav } from "@/components/nav/bottom-nav";
import { AnalyticsLoader } from "@/components/analytics/analytics-loader";
import { AnalyticsSkeleton } from "@/components/analytics/analytics-skeleton";
import { getActiveSleepSession } from "@/app/actions/sleep";
import { getUserProfile } from "@/app/actions/profile";

export default async function DashboardPage() {
  const session = await auth();
  const user = session!.user;

  const profileResult = await getUserProfile();
  if (profileResult.success && !profileResult.data.onboardedAt) {
    redirect("/onboarding");
  }

  const activeSessionResult = await getActiveSleepSession();

  return (
    <div className="relative min-h-dvh">
      <Sidebar userName={user.name ?? null} userImage={user.image ?? null} />

      <main className="flex min-h-dvh flex-col sm:pl-20">
        <header className="flex items-center justify-between px-6 py-5 sm:hidden">
          <div className="flex items-center gap-3">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "Profile photo"}
                width={36}
                height={36}
                className="rounded-full ring-1 ring-white/10"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-secondary" />
            )}
            <div className="leading-tight">
              <p className="text-sm font-medium">
                {user.name?.split(" ")[0] ?? "there"}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <SignOutButton />
        </header>

        <section
          id="sleep"
          className="flex flex-col items-center justify-center px-6 pb-16 pt-4"
        >
          {activeSessionResult.success ? (
            <SleepDashboard initialActiveSession={activeSessionResult.data} />
          ) : (
            <div className="glass-panel rounded-2xl p-6 text-center text-sm text-destructive">
              Couldn&apos;t load your sleep status: {activeSessionResult.error}
            </div>
          )}
        </section>

        <section
          id="insights"
          className="flex flex-1 flex-col items-center px-6 pb-28 sm:pb-16"
        >
          <Suspense fallback={<AnalyticsSkeleton />}>
            <AnalyticsLoader />
          </Suspense>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
