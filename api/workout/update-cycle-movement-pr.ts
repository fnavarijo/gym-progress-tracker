'use server';

import { createClient } from '@/lib/supabase/server';

export interface UpdatedSet {
  setNumber: number;
  scheduledWeight: number;
}

interface RpcRow {
  out_set_number: number;
  out_scheduled_weight: string;
}

export async function updateCycleMovementPr(
  workoutId: number,
  cycleMovementId: number,
  pr: number,
): Promise<{ data: UpdatedSet[] | null; error: string | null }> {
  const supabase = await createClient();

  console.log('Parametes', workoutId, cycleMovementId, pr);
  const { data, error } = await supabase.rpc('update_cycle_movement_pr', {
    p_workout_id: workoutId,
    p_cycle_movement_id: cycleMovementId,
    p_pr: pr,
  });

  console.log('Error', error);
  if (error) return { data: null, error: error.message };

  return {
    data: (data as RpcRow[]).map((r) => ({
      setNumber: r.out_set_number,
      scheduledWeight: parseFloat(r.out_scheduled_weight),
    })),
    error: null,
  };
}
