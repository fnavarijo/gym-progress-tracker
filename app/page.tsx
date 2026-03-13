import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { NoCycleState } from '@/components/app/no-active-cycle';
import { DashboardGreeting } from '@/components/app/dashboard-greeting';
import { WorkoutProgress } from '@/components/app/workout-progress';
import { getUserActiveCycle } from '@/api/cycle/get-user-active-cycle';
import { hasUserPastCycles } from '@/api/cycle/has-user-past-cycles';
import { LogoutButton } from '@/components/logout-button';

function WorkoutProgressSkeleton() {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col animate-pulse">
      <div className="h-20 bg-muted rounded-xl mx-4 mt-4" />
      <div className="flex-1 px-4 pt-6 flex flex-col gap-3">
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-14 bg-muted rounded-xl" />
        <div className="h-14 bg-muted rounded-xl" />
        <div className="h-14 bg-muted rounded-xl" />
        <div className="h-14 bg-muted rounded-xl" />
        <div className="h-14 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

export default async function HomePage() {
  const activeCycle = await getUserActiveCycle();

  if (!activeCycle) {
    const hasPastCycles = await hasUserPastCycles();
    if (hasPastCycles) redirect('/cycle/new');

    return (
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        {/* Branding panel — desktop only */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-primary/8 via-primary/5 to-transparent border-r flex-col justify-center px-12 lg:px-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Momentum
          </p>
          <h2 className="text-5xl font-bold tracking-tight leading-tight">
            Build strength,<br />track progress.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-sm">
            Your personal weightlifting companion. Track PRs, follow structured cycles, and watch yourself grow stronger every week.
          </p>
        </div>

        {/* Action panel */}
        <div className="w-full md:w-[420px] md:shrink-0 flex flex-col min-h-screen md:h-screen md:overflow-y-auto">
          <div className="bg-gradient-to-b from-primary/8 to-transparent md:bg-none">
            <Suspense fallback={<div className="px-4 pt-8 pb-4 h-24" />}>
              <DashboardGreeting />
            </Suspense>
          </div>
          <main className="flex-1 flex flex-col justify-start px-4 md:px-6 pt-2 pb-24 md:pb-8 md:pt-2">
            <NoCycleState />
          </main>
          <div className="sticky md:relative bottom-0 px-4 md:px-6 pb-6 pt-10 flex flex-col gap-2 bg-gradient-to-t from-background via-background/95 to-transparent md:bg-none md:pt-0">
            <LogoutButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<WorkoutProgressSkeleton />}>
      <WorkoutProgress cycle={activeCycle} />
    </Suspense>
  );
}
