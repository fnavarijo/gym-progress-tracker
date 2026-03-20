import { CycleWorkout } from '@/api/workout/get-cycle-workouts';
import { PlanMovement } from '@/api/plan/get-plan-movements';
import { cn } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

interface Props {
  workouts: CycleWorkout[];
  totalWeeks: number;
  currentWeek: number;
  planMovements: PlanMovement[];
}

function cellClasses(workout: CycleWorkout | undefined, week: number, currentWeek: number): string {
  if (!workout) {
    if (week > currentWeek) return 'bg-muted/50';
    return 'bg-muted-foreground/20';
  }
  if (workout.completed) return 'bg-primary';
  if (week > currentWeek) return 'bg-muted/50';
  if (week === currentWeek) return 'bg-primary/20 border border-primary/40';
  return 'bg-muted-foreground/20';
}

function weekSummaryClass(completedCount: number, total: number, week: number, currentWeek: number): string {
  if (completedCount === 0) {
    if (week > currentWeek) return 'bg-muted/50';
    return 'bg-muted-foreground/20';
  }
  if (completedCount >= total) return 'bg-primary';
  return 'bg-primary/40';
}

export async function CycleHeatmap({ workouts, totalWeeks, currentWeek, planMovements }: Props) {
  const t = await getTranslations('Cycle.summary');

  const movements = planMovements.map((m) => m.name);

  // Lookup: movement name → week → CycleWorkout
  const lookup = new Map<string, Map<number, CycleWorkout>>();
  for (const workout of workouts) {
    if (!lookup.has(workout.name)) lookup.set(workout.name, new Map());
    lookup.get(workout.name)!.set(workout.week, workout);
  }

  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  return (
    <div className="px-4 mt-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        {t('consistencyHeatmap')}
      </h2>
      <div className="bg-card border rounded-xl p-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {/* empty corner cell */}
              <th className="w-24 shrink-0" />
              {weeks.map((week) => (
                <th
                  key={week}
                  className="text-xs text-muted-foreground font-medium pb-2 text-center w-8"
                >
                  W{week}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movements.map((name) => {
              const weekMap = lookup.get(name) ?? new Map<number, CycleWorkout>();
              return (
                <tr key={name}>
                  <td className="pr-3 py-1">
                    <span className="text-xs font-medium text-muted-foreground truncate block max-w-[90px]">
                      {name}
                    </span>
                  </td>
                  {weeks.map((week) => {
                    const workout = weekMap.get(week);
                    const classes = cn(
                      'w-8 h-8 rounded-md',
                      cellClasses(workout, week, currentWeek),
                    );
                    const isClickable = workout && week <= currentWeek;

                    return (
                      <td key={week} className="py-1 px-0.5 text-center">
                        {isClickable ? (
                          <Link
                            href={`/workout/movement/${workout.cycleMovementId}`}
                            className={cn(classes, 'block mx-auto hover:opacity-80 transition-opacity')}
                            title={`${name} — Week ${week}`}
                          />
                        ) : (
                          <div className={cn(classes, 'mx-auto')} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {/* Week summary row */}
            <tr>
              <td className="pr-3 pt-3 pb-1 border-t border-border">
                <span className="text-xs font-semibold text-foreground truncate block max-w-[90px]">
                  {t('weekSummaryLabel')}
                </span>
              </td>
              {weeks.map((week) => {
                const completedThisWeek = workouts.filter(
                  (workout) => workout.week === week && workout.completed,
                ).length;
                return (
                  <td key={week} className="pt-3 pb-1 px-0.5 text-center border-t border-border">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-md mx-auto',
                        weekSummaryClass(completedThisWeek, planMovements.length, week, currentWeek),
                      )}
                    />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 pt-3 border-t">
          <LegendItem color="bg-primary" label={t('legendDone')} />
          <LegendItem color="bg-primary/20 border border-primary/40" label={t('legendInProgress')} />
          <LegendItem color="bg-muted-foreground/20" label={t('legendMissed')} />
          <LegendItem color="bg-muted/50" label={t('legendUpcoming')} />
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('w-3 h-3 rounded-sm', color)} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
