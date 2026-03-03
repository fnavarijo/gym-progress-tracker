import { Suspense } from 'react';
import { NoCycleState } from '@/components/app/no-active-cycle';
import { DashboardGreeting } from '@/components/app/dashboard-greeting';
import { WorkoutProgress } from '@/components/app/workout-progress';
import { getUserActiveCycle } from '@/api/cycle/get-user-active-cycle';

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
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col">
        <Suspense fallback={<div className="px-4 pt-6 pb-4 h-24" />}>
          <DashboardGreeting />
        </Suspense>
        <main className="flex-1 flex flex-col justify-center px-4 pb-8">
          <div className="flex flex-col gap-4">
            <NoCycleState />
          </div>
        </main>
      </div>
    );
  }

  return (
    <Suspense fallback={<WorkoutProgressSkeleton />}>
      <WorkoutProgress cycle={activeCycle} />
    </Suspense>
  );
}
