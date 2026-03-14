'use server';
import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// Raw DB row shape (file-private)
// ---------------------------------------------------------------------------

interface GetOrCreateWorkoutRow {
  out_workout_id: number;
  out_is_evaluation: boolean;
  out_plan_routine_id: number;
  out_set_number: number;
  out_scheduled_weight: string | null;
  out_completed_at: string | null;
}

// ---------------------------------------------------------------------------
// Public model
// ---------------------------------------------------------------------------

export interface WorkoutSet {
  planRoutineId: number;
  setNumber: number;
  scheduledWeight: number | null;
  completedAt: string | null;
}

export interface GetOrCreateWorkoutResult {
  workoutId: number;
  isEvaluation: boolean;
  sets: WorkoutSet[];
}

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

export async function getOrCreateWorkout(
  cycleMovementId: number,
  week: number,
): Promise<GetOrCreateWorkoutResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_or_create_workout', {
    p_cycle_movement_id: cycleMovementId,
    p_week: week,
  });

  console.log('Error', error);

  if (error) throw error;

  const rows = data as GetOrCreateWorkoutRow[];

  return {
    workoutId: rows[0].out_workout_id,
    isEvaluation: rows[0].out_is_evaluation,
    sets: rows.map((r) => ({
      planRoutineId: r.out_plan_routine_id,
      setNumber: r.out_set_number,
      scheduledWeight:
        r.out_scheduled_weight !== null
          ? parseFloat(r.out_scheduled_weight)
          : null,
      completedAt: r.out_completed_at,
    })),
  };
}
