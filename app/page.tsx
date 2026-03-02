import Link from 'next/link';
import { Suspense } from 'react';
import { CycleProgressHeader } from '@/components/app/cycle-progress-header';
import { WeekProgressCard } from '@/components/app/week-progress-card';
import { WorkoutList } from '@/components/app/workout-list';
import { NoCycleState } from '@/components/app/no-active-cycle';
import { DashboardGreeting } from '@/components/app/dashboard-greeting';
import { Button } from '@/components/ui/button';

interface Workout {
  id: string;
  name: string;
  topSet: number;
  completed: boolean;
}

interface WeekProgress {
  completed: number;
  total: number;
}

interface CycleInfo {
  currentWeek: number;
  totalWeeks: number;
  weeksCompleted: number;
}

const cycleInfo: CycleInfo = { currentWeek: 1, totalWeeks: 6, weeksCompleted: 0 };
const weekProgress: WeekProgress = { completed: 1, total: 5 };
const workouts: Workout[] = [
  { id: '1', name: 'Back Squat',   topSet: 20, completed: true  },
  { id: '2', name: 'Deadlift',     topSet: 20, completed: false },
  { id: '3', name: 'Bench Press',  topSet: 20, completed: false },
  { id: '4', name: 'Strict Press', topSet: 20, completed: false },
  { id: '5', name: 'Front Squat',  topSet: 20, completed: false },
];

export default function HomePage() {
  // TODO: replace with real DB lookup
  const hasActiveCycle = true;

  if (!hasActiveCycle) {
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

  const firstIncomplete = workouts.find((w) => !w.completed);

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col">
      <CycleProgressHeader cycleInfo={cycleInfo} />
      <main className="flex-1 overflow-y-auto px-4 pb-32">
        <section>
          <h2 className="text-xl font-bold mb-3">Weekly Progress</h2>
          <WeekProgressCard weekProgress={weekProgress} />
        </section>
        <section className="mt-4">
          <WorkoutList workouts={workouts} />
        </section>
      </main>
      <div className="sticky bottom-0 bg-background px-4 pb-6 pt-2 flex flex-col gap-3">
        <Button asChild className="w-full" size="lg">
          <Link href={firstIncomplete ? `/progress/workout/${firstIncomplete.id}` : '/progress/workout'}>
            Continue Workout
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full" size="lg">
          <Link href="/cycle/summary">View Full Cycle</Link>
        </Button>
      </div>
    </div>
  );
}
