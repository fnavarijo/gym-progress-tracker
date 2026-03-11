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
  week: number;
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
      .select('id, movement_id, max_pr, workouts(completed_at, week)')
      .eq('cycle_id', cycleId),
  ]);

  if (queryA.error) throw queryA.error;
  if (queryB.error) throw queryB.error;

  const planMovements  = queryA.data as unknown as PlanMovementRow[];
  const cycleMovements = queryB.data as unknown as CycleMovementRow[];

  const cycleByMovementId = new Map(
    cycleMovements.map((cm) => [cm.movement_id, cm]),
  );

  return planMovements.map((pm) => {
    const cm = cycleByMovementId.get(pm.movement_id);
    const workoutsForWeek = cm?.workouts.filter((w) => w.week === week) ?? [];
    const completed = workoutsForWeek.some((w) => w.completed_at !== null);

    return {
      cycleMovementId: cm?.id ?? 0,
      name:            pm.movements.name,
      maxPr:           cm?.max_pr != null ? parseFloat(cm.max_pr) : null,
      dayOfWeek:       pm.day_of_week,
      completed,
    };
  });
}
