import Link from 'next/link';
import { Suspense } from 'react';
import { NoCycleState } from '@/components/app/no-active-cycle';
import { DashboardGreeting } from '@/components/app/dashboard-greeting';
import { WorkoutProgress } from '@/components/app/workout-progress';
import { getUserActiveCycle } from '@/api/cycle/get-user-active-cycle';
import { LogoutButton } from '@/components/logout-button';
import { Button } from '@/components/ui/button';

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
        <div className="bg-gradient-to-b from-primary/8 to-transparent">
          <Suspense fallback={<div className="px-4 pt-8 pb-4 h-24" />}>
            <DashboardGreeting />
          </Suspense>
        </div>
        <main className="flex-1 flex flex-col justify-center px-4 pb-40">
          <NoCycleState />
        </main>
        <div className="sticky bottom-0 px-4 pb-6 pt-10 flex flex-col gap-2 bg-gradient-to-t from-background via-background/95 to-transparent">
          <Button asChild className="rounded-xl h-14 text-base font-semibold w-full">
            <Link href="/cycle/new">Create Cycle</Link>
          </Button>
          <LogoutButton />
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
