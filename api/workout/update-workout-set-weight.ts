'use server';
import { createClient } from '@/lib/supabase/server';

export async function updateWorkoutSetWeight(
  setId: number,
  usedWeight: number,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('workout_sets')
    .update({ used_weight: usedWeight })
    .eq('id', setId);

  if (error) return { error: error.message };
  return { error: null };
}
