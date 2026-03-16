import { CycleWorkout } from '@/api/workout/get-cycle-workouts';
import { getTranslations } from 'next-intl/server';

interface Props {
  workouts: CycleWorkout[];
  currentWeek: number;
  totalWeeks: number;
}

function computeStreak(workouts: CycleWorkout[], currentWeek: number): number {
  // Group by week — check all known workouts for that week are completed
  const weekMap = new Map<number, CycleWorkout[]>();
  for (const workout of workouts) {
    const list = weekMap.get(workout.week) ?? [];
    list.push(workout);
    weekMap.set(workout.week, list);
  }

  let streak = 0;
  for (let week = currentWeek; week >= 1; week--) {
    const weekWorkouts = weekMap.get(week);
    if (!weekWorkouts || weekWorkouts.length === 0) break;
    if (weekWorkouts.every((workout) => workout.completed)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export async function CycleStats({ workouts, currentWeek, totalWeeks }: Props) {
  const total     = workouts.length;
  const completed = workouts.filter((workout) => workout.completed).length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
  const streak    = computeStreak(workouts, currentWeek);
  const t         = await getTranslations('Cycle.summary');

  return (
    <div className="px-4 mt-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        {t('cycleProgress')}
      </h2>
      <div className="bg-card border rounded-xl p-4 flex items-start gap-6">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold tabular-nums leading-none text-foreground">
              {completed}
            </span>
            <span className="text-xl font-medium text-muted-foreground">/ {total}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t('workoutsDone')}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary w-fit">
            {pct}{t('complete')}
          </span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground w-fit">
              {streak === totalWeeks ? '🔥' : ''}{t('weekStreak', { count: streak })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
