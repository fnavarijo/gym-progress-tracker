import { CycleProgressHeader } from '@/components/app/cycle-progress-header';
import { WeekProgressCard } from '@/components/app/week-progress-card';
import { WorkoutList } from '@/components/app/workout-list';
import { NoCycleState } from '@/components/app/no-active-cycle';
import { DashboardGreeting } from '@/components/app/dashboard-greeting';
import { Suspense } from 'react';

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

const cycleInfo: CycleInfo = {
  currentWeek: 2,
  totalWeeks: 6,
  weeksCompleted: 2,
};
const weekProgress: WeekProgress = { completed: 2, total: 5 };
const workouts: Workout[] = [
  { id: '1', name: 'Back Squat', topSet: 20, completed: true },
  { id: '2', name: 'Deadlift', topSet: 20, completed: true },
  { id: '3', name: 'Strict Press', topSet: 45, completed: false },
  { id: '4', name: 'Clean', topSet: 35, completed: false },
];

export default function HomePage() {
  // TODO: replace with real DB lookup
  const hasActiveCycle = false;

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

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <CycleProgressHeader cycleInfo={cycleInfo} />
      <main className="px-4 pt-6 pb-8 flex flex-col gap-6">
        <section>
          <h2 className="text-xl font-bold mb-3">This Week&apos;s Progress</h2>
          <WeekProgressCard weekProgress={weekProgress} />
        </section>
        <WorkoutList workouts={workouts} />
      </main>
    </div>
  );
}
