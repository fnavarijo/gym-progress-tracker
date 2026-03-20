import { CycleWorkout } from '@/api/workout/get-cycle-workouts';
import { PlanMovement } from '@/api/plan/get-plan-movements';
import { cn } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';

interface Props {
  workouts: CycleWorkout[];
  currentWeek: number;
  totalWeeks: number;
  planMovements: PlanMovement[];
}

function weekSegmentClass(completed: number, total: number): string {
  if (completed === 0) return 'bg-muted';
  if (completed >= total) return 'bg-primary';
  return 'bg-primary/40';
}

export async function CycleStats({ workouts, totalWeeks, planMovements }: Props) {
  const movementsPerWeek = planMovements.length;
  const showLabels = totalWeeks <= 6;
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  const t = await getTranslations('Cycle.summary');

  return (
    <div className="px-4 mt-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        {t('cycleProgress')}
      </h2>
      <div className="bg-card border rounded-xl p-4">
        <div className="flex gap-1.5">
          {weeks.map((week) => {
            const completedThisWeek = workouts.filter(
              (workout) => workout.week === week && workout.completed,
            ).length;
            return (
              <div key={week} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-full h-6 rounded-sm',
                    weekSegmentClass(completedThisWeek, movementsPerWeek),
                  )}
                />
                {showLabels && (
                  <span className="text-[10px] text-muted-foreground font-medium">
                    W{week}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3">{t('cycleOverview')}</p>
      </div>
    </div>
  );
}
