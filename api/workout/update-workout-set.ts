'use server';
import { createClient } from '@/lib/supabase/server';

export async function updateWorkoutSet(
  setId: number,
  completed: boolean,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('workout_sets')
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq('id', setId);

  if (error) return { error: error.message };
  return { error: null };
}
