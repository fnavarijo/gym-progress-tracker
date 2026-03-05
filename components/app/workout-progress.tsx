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
  const workouts = await getWorkoutByWeek(cycle.id, cycle.currentWeek);

  const weekProgress = {
    completed: workouts.filter((w) => w.completed).length,
    total: workouts.length,
  };

  const firstIncomplete = workouts.find((w) => !w.completed);

  const cycleInfo = {
    currentWeek: cycle.currentWeek,
    totalWeeks: cycle.totalWeeks,
    weeksCompleted: cycle.currentWeek - 1,
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col">
      <div className="bg-gradient-to-b from-primary/8 to-transparent">
        <CycleProgressHeader cycleInfo={cycleInfo} />
      </div>
      <main className="flex-1 overflow-y-auto px-4 pb-40">
        <section>
          <WeekProgressCard weekProgress={weekProgress} />
        </section>
        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            This Week&apos;s Lifts
          </h2>
          <WorkoutList workouts={workouts} />
        </section>
      </main>
      <div className="sticky bottom-0 px-4 pb-6 pt-10 flex flex-col gap-2 bg-gradient-to-t from-background via-background/95 to-transparent">
        <Button
          asChild
          className="w-full rounded-xl h-14 text-base font-semibold"
          size="lg"
        >
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
        <Button
          asChild
          variant="ghost"
          className="w-full rounded-xl h-11 text-muted-foreground"
          size="lg"
        >
          <Link href="/cycle/summary">View Full Cycle</Link>
        </Button>
      </div>
    </div>
  );
}
