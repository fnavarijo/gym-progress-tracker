import Link from 'next/link';
import { Cycle } from '@/api/cycle/get-user-active-cycle';
import { getWorkoutByWeek } from '@/api/workout/get-workout-by-week';
import { CycleProgressHeader } from '@/components/app/cycle-progress-header';
import { WeekProgressCard } from '@/components/app/week-progress-card';
import { WorkoutList } from '@/components/app/workout-list';
import { Button } from '@/components/ui/button';

interface WorkoutProgressProps {
  cycle: Cycle;
}

export async function WorkoutProgress({ cycle }: WorkoutProgressProps) {
  const workouts = await getWorkoutByWeek(cycle.id, 1);

  const weekProgress = {
    completed: workouts.filter((w) => w.completed).length,
    total:     workouts.length,
  };

  const firstIncomplete = workouts.find((w) => !w.completed);

  const cycleInfo = {
    currentWeek:    cycle.currentWeek,
    totalWeeks:     cycle.totalWeeks,
    weeksCompleted: cycle.currentWeek - 1,
  };

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
          <Link
            href={
              firstIncomplete
                ? `/progress/workout/${firstIncomplete.id}`
                : '/progress/workout'
            }
          >
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
