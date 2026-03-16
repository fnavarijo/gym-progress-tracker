'use server';
import { createClient } from '@/lib/supabase/server';

export interface CycleMovementEntry {
  cycleMovementId: number;
  name: string;
  maxPr: number | null;
  dayOfWeek: number;
  completed: boolean;
}

interface PlanMovementRow {
  movement_id: number;
  day_of_week: number;
  movements: { name: string };
  plan_routines: { week: number }[];
}

interface WorkoutRow {
  completed_at: string | null;
}

interface CycleMovementRow {
  id: number;
  movement_id: number;
  max_pr: string | null;
  workouts: WorkoutRow[];
}

export async function getCycleMovementsForWeek(
  cycleId: number,
  planId: number,
  week: number,
): Promise<CycleMovementEntry[]> {
  const supabase = await createClient();

  const [queryA, queryB] = await Promise.all([
    supabase
      .from('plan_movements')
      .select('movement_id, day_of_week, movements!inner(name), plan_routines!inner(week)')
      .eq('plan_id', planId)
      .eq('plan_routines.week', week),
    supabase
      .from('cycle_movements')
      .select('id, movement_id, max_pr, workouts(completed_at)')
      .eq('cycle_id', cycleId)
      .eq('workouts.week', week),
  ]);

  if (queryA.error) throw queryA.error;
  if (queryB.error) throw queryB.error;

  const planMovements  = queryA.data as unknown as PlanMovementRow[];
  const cycleMovements = queryB.data as unknown as CycleMovementRow[];

  const cycleByMovementId = new Map(
    cycleMovements.map((cycleMovement) => [cycleMovement.movement_id, cycleMovement]),
  );

  return planMovements.sort((a, b) => a.day_of_week - b.day_of_week).map((planMovement) => {
    const cycleMovement = cycleByMovementId.get(planMovement.movement_id);
    const completed = cycleMovement?.workouts.some((workout) => workout.completed_at !== null) ?? false;

    return {
      cycleMovementId: cycleMovement?.id ?? 0,
      name:            planMovement.movements.name,
      maxPr:           cycleMovement?.max_pr != null ? parseFloat(cycleMovement.max_pr) : null,
      dayOfWeek:       planMovement.day_of_week,
      completed,
    };
  });
}
