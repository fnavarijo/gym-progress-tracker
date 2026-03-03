'use server';
import { createClient } from '@/lib/supabase/server';

export async function updateWorkout(
  workoutId: number,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('workouts')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', workoutId);

  if (error) return { error: error.message };
  return { error: null };
}
