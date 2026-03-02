'use server';

import { createClient } from '@/lib/supabase/server';

interface CreateCycleParams {
  /** YYYY-MM-DD */
  date: string;
  /** Keyed by movement id: { [movementId]: prValue } */
  prs: Record<number, number>;
}

export async function createCycle({
  date,
  prs,
}: CreateCycleParams): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('create_cycle_with_workouts', {
    p_plan_id: 1,
    p_start_date: date,
    p_pr_by_movement: prs,
    p_round_increment: 5,
  });

  if (error) return { error: error.message };
  return { error: null };
}
