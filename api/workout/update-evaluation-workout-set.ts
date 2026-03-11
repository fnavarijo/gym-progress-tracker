'use server';
import { createClient } from '@/lib/supabase/server';

export async function updateEvaluationWorkoutSet(
  setId: number,
  usedWeight: number,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('workout_sets')
    .update({ used_weight: usedWeight, completed_at: new Date().toISOString() })
    .eq('id', setId);

  if (error) return { error: error.message };
  return { error: null };
}
