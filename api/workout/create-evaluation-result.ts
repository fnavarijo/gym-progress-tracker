'use server';
import { createClient } from '@/lib/supabase/server';

export async function createEvaluationResult(
  cycleMovementId: number,
  usedWeight: number,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('evaluation_results')
    .insert({ cycle_movement_id: cycleMovementId, used_weight: usedWeight });

  if (error) return { error: error.message };
  return { error: null };
}
