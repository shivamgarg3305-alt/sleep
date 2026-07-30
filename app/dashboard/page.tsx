import { Suspense } from "react";
import Image from "next/image";

import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { SleepDashboard } from "@/components/sleep/sleep-dashboard";
import { Sidebar } from "@/components/nav/sidebar";
import { BottomNav } from "@/components/nav/bottom-nav";
import { AnalyticsLoader } from "@/components/analytics/analytics-loader";
import { AnalyticsSkeleton } from "@/components/analytics/analytics-skeleton";
import { getActiveSleepSession } from "@/app/actions/sleep";

/**
 * Protected dashboard: single scrollable page with two sections —
 * #sleep (the One-Tap toggle) and #insights (stats + 7-day chart) — that
 * the responsive nav (bottom bar on mobile, sidebar on desktop) scrolls
 * between.
 *
 * The active sleep session is fetched up front since it drives the primary
 * button's state. Insights are fetched in a separate async component
 * (<AnalyticsLoader>) wrapped in <Suspense>, so the toggle paints
 * immediately and the analytics stream in a beat later behind a skeleton
 * rather than blocking the whole page on a second query.
 */
export default async function DashboardPage() {
  // Safe to assert non-null: middleware guarantees a session reached this point.
  const session = await auth();
  const user = session!.user;

  const activeSessionResult = await getActiveSleepSession();

  return (
    <div className="relative min-h-dvh">
      <Sidebar userName={user.name ?? null} userImage={user.image ?? null} />

      <main className="flex min-h-dvh flex-col sm:pl-20">
        {/* Mobile-only top bar — desktop identity/sign-out lives in the sidebar */}
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
