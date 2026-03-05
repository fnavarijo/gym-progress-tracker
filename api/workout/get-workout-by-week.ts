import { createClient } from '@/lib/supabase/server';

interface WorkoutSetRow {
  set_number: number;
  scheduled_weight: number;
  plan_routines: { plan_movements: { day_of_week: number } };
}
interface CycleMovementRow {
  cycle_id: number;
  movements: { name: string };
}
interface WorkoutRow {
  id: number;
  completed_at: string | null;
  cycle_movements: CycleMovementRow;
  workout_sets: WorkoutSetRow[];
}

export interface WorkoutEntry {
  id: number;
  name: string;
  topSet: number;
  completed: boolean;
  dayOfWeek: number;
}

function toWorkoutEntry(row: WorkoutRow): WorkoutEntry {
  const topSet = [...row.workout_sets].sort(
    (a, b) => b.set_number - a.set_number,
  )[0];
  return {
    id:         row.id,
    name:       row.cycle_movements.movements.name,
    topSet:     topSet?.scheduled_weight ?? 0,
    completed:  row.completed_at !== null,
    dayOfWeek:  row.workout_sets[0]?.plan_routines?.plan_movements?.day_of_week ?? 0,
  };
}

export async function getWorkoutByWeek(
  cycleId: number,
  week: number,
): Promise<WorkoutEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('workouts')
    .select(
      `
      id,
      completed_at,
      cycle_movements!inner ( cycle_id, movements!inner ( name ) ),
      workout_sets ( set_number, scheduled_weight, plan_routines!inner ( plan_movements!inner ( day_of_week ) ) )
    `,
    )
    .eq('week', week)
    .eq('cycle_movements.cycle_id', cycleId)
    .order('id');

  if (error) throw error;
  return (data as unknown as WorkoutRow[]).map(toWorkoutEntry);
}
