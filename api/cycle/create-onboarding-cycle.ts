'use server';

import { createClient } from '@/lib/supabase/server';

export async function createOnboardingCycle({
  planId,
  date,
}: {
  planId: number;
  date: string;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('create_onboarding_cycle', {
    p_plan_id: planId,
    p_start_date: date,
  });
  if (error) return { error: error.message };
  return { error: null };
}
