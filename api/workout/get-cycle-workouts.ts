import { createClient } from '@/lib/supabase/server';

interface WorkoutRow {
  id: number;
  week: number;
  completed_at: string | null;
  cycle_movements: {
    cycle_id: number;
    movements: { name: string };
  };
}

export interface CycleWorkout {
  id: number;
  week: number;
  name: string;
  completed: boolean;
  completedAt: string | null;
}

function toCycleWorkout(row: WorkoutRow): CycleWorkout {
  return {
    id:          row.id,
    week:        row.week,
    name:        row.cycle_movements.movements.name,
    completed:   row.completed_at !== null,
    completedAt: row.completed_at,
  };
}

export async function getCycleWorkouts(cycleId: number): Promise<CycleWorkout[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('workouts')
    .select('id, week, completed_at, cycle_movements!inner(cycle_id, movements!inner(name))')
    .eq('cycle_movements.cycle_id', cycleId)
    .order('week')
    .order('id');

  if (error) throw error;
  return (data as unknown as WorkoutRow[]).map(toCycleWorkout);
}
