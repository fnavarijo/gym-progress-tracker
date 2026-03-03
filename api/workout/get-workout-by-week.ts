import { createClient } from '@/lib/supabase/server';

interface WorkoutSetRow {
  set_number: number;
  scheduled_weight: number;
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
}

function toWorkoutEntry(row: WorkoutRow): WorkoutEntry {
  const topSet = [...row.workout_sets].sort(
    (a, b) => b.set_number - a.set_number,
  )[0];
  return {
    id: row.id,
    name: row.cycle_movements.movements.name,
    topSet: topSet?.scheduled_weight ?? 0,
    completed: row.completed_at !== null,
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
      workout_sets ( set_number, scheduled_weight )
    `,
    )
    .eq('week', week)
    .eq('cycle_movements.cycle_id', cycleId)
    .order('id');

  if (error) throw error;
  return (data as unknown as WorkoutRow[]).map(toWorkoutEntry);
}
