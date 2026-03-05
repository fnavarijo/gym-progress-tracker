import { CycleWorkout } from '@/api/workout/get-cycle-workouts';

interface Props {
  workouts: CycleWorkout[];
  currentWeek: number;
  totalWeeks: number;
}

function computeStreak(workouts: CycleWorkout[], currentWeek: number): number {
  // Group by week — check all known workouts for that week are completed
  const weekMap = new Map<number, CycleWorkout[]>();
  for (const w of workouts) {
    const list = weekMap.get(w.week) ?? [];
    list.push(w);
    weekMap.set(w.week, list);
  }

  let streak = 0;
  for (let week = currentWeek; week >= 1; week--) {
    const weekWorkouts = weekMap.get(week);
    if (!weekWorkouts || weekWorkouts.length === 0) break;
    if (weekWorkouts.every((w) => w.completed)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function CycleStats({ workouts, currentWeek, totalWeeks }: Props) {
  const total     = workouts.length;
  const completed = workouts.filter((w) => w.completed).length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
  const streak    = computeStreak(workouts, currentWeek);

  return (
    <div className="px-4 mt-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Cycle Progress
      </h2>
      <div className="bg-card border rounded-xl p-4 flex items-start gap-6">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold tabular-nums leading-none text-foreground">
              {completed}
            </span>
            <span className="text-xl font-medium text-muted-foreground">/ {total}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">workouts done</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary w-fit">
            {pct}% complete
          </span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground w-fit">
              {streak === totalWeeks ? '🔥' : ''}{streak} week streak
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
