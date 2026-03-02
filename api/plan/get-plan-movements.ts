import { createClient } from '@/lib/supabase/server';

/** Raw shape of a movements row returned by Supabase. */
interface MovementRow {
  id: number;
  name: string;
}

/** Raw shape returned by the plan_movements join query. */
interface PlanMovementRow {
  movements: MovementRow | null;
}

/** App-level model for a plan movement — all properties in camelCase. */
export interface PlanMovement {
  id: number;
  name: string;
}

function toMovement(row: MovementRow): PlanMovement {
  return {
    id:   row.id,
    name: row.name,
  };
}

export async function getPlanMovements(
  planId: number,
): Promise<PlanMovement[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('plan_movements')
    .select('movements(id, name)')
    .eq('plan_id', planId)
    .order('id');

  if (error) throw error;

  return (
    (data ?? [])
      // TODO: Update with Supabase TS setup
      .map((row) => (row as unknown as PlanMovementRow).movements)
      .filter((movement): movement is MovementRow => movement !== null)
      .map(toMovement)
  );
}
