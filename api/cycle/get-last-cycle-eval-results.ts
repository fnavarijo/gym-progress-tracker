import { createClient } from '@/lib/supabase/server';

export interface EvalResult {
  movementId: number;
  movementName: string;
  usedWeight: number;
}

interface EvalResultRow {
  movement_id: number;
  movements: { id: number; name: string };
  evaluation_results: { used_weight: string };
}

export async function getLastCycleEvalResults(): Promise<EvalResult[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: lastCycle, error: cycleError } = await supabase
    .from('cycles')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (cycleError) throw cycleError;
  if (!lastCycle) return [];

  const { data, error: movementsError } = await supabase
    .from('cycle_movements')
    .select('movement_id, movements!inner(id, name), evaluation_results!inner(used_weight)')
    .eq('cycle_id', lastCycle.id);

  if (movementsError) throw movementsError;

  return (data ?? []).map((row) => {
    const r = row as unknown as EvalResultRow;
    return {
      movementId: r.movement_id,
      movementName: r.movements.name,
      usedWeight: parseFloat(r.evaluation_results.used_weight),
    };
  });
}
