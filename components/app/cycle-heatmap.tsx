import Link from 'next/link';
import { CycleWorkout } from '@/api/workout/get-cycle-workouts';
import { cn } from '@/lib/utils';

interface Props {
  workouts: CycleWorkout[];
  totalWeeks: number;
  currentWeek: number;
}

function cellClasses(workout: CycleWorkout | undefined, week: number, currentWeek: number): string {
  if (!workout) {
    // No workout scheduled for this cell
    if (week > currentWeek) return 'bg-muted/50';
    return 'bg-muted-foreground/20';
  }
  if (workout.completed) return 'bg-primary';
  if (week > currentWeek) return 'bg-muted/50';
  if (week === currentWeek) return 'bg-primary/20 border border-primary/40';
  return 'bg-muted-foreground/20';
}

export function CycleHeatmap({ workouts, totalWeeks, currentWeek }: Props) {
  // Unique movement names in order of first appearance
  const movements: string[] = [];
  const seen = new Set<string>();
  for (const w of workouts) {
    if (!seen.has(w.name)) {
      seen.add(w.name);
      movements.push(w.name);
    }
  }

  // Lookup: movement name → week → CycleWorkout
  const lookup = new Map<string, Map<number, CycleWorkout>>();
  for (const w of workouts) {
    if (!lookup.has(w.name)) lookup.set(w.name, new Map());
    lookup.get(w.name)!.set(w.week, w);
  }

  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  return (
    <div className="px-4 mt-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Consistency Heatmap
      </h2>
      <div className="bg-card border rounded-xl p-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {/* empty corner cell */}
              <th className="w-24 shrink-0" />
              {weeks.map((w) => (
                <th
                  key={w}
                  className="text-xs text-muted-foreground font-medium pb-2 text-center w-8"
                >
                  W{w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movements.map((name) => {
              const weekMap = lookup.get(name)!;
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
                            href={`/progress/workout/${workout.id}`}
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
          </tbody>
        </table>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 pt-3 border-t">
          <LegendItem color="bg-primary" label="Done" />
          <LegendItem color="bg-primary/20 border border-primary/40" label="In progress" />
          <LegendItem color="bg-muted-foreground/20" label="Missed" />
          <LegendItem color="bg-muted/50" label="Upcoming" />
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
