import { createClient } from '@/lib/supabase/server';

interface RoutineRow {
  week: number;
  set_number: number;
  percentage_pr: string;
  repetitions: number;
}

interface MovementRow {
  name: string;
}

interface PlanMovementRow {
  id: number;
  day_of_week: number;
  movement_id: number;
  movements: MovementRow | null;
  plan_routines: RoutineRow[];
}

interface PlanRow {
  id: number;
  name: string;
  description: string | null;
  length_weeks: number;
  is_system: boolean;
  slug: string | null;
  evaluation_week: number | null;
  plan_movements: PlanMovementRow[];
}

export interface PlanRoutineDetail {
  week: number;
  setNumber: number;
  percentagePr: number;
  repetitions: number;
}

export interface PlanMovementDetail {
  id: number;
  movementId: number;
  movementName: string;
  dayOfWeek: number;
  routines: PlanRoutineDetail[];
}

export interface PlanDetail {
  id: number;
  name: string;
  description: string | null;
  lengthWeeks: number;
  isSystem: boolean;
  slug: string | null;
  evaluationWeek: number | null;
  planMovements: PlanMovementDetail[];
}

function toPlanDetail(row: PlanRow): PlanDetail {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    lengthWeeks: row.length_weeks,
    isSystem: row.is_system,
    slug: row.slug,
    evaluationWeek: row.evaluation_week,
    planMovements: row.plan_movements.map((planMovement) => ({
      id: planMovement.id,
      movementId: planMovement.movement_id,
      movementName: planMovement.movements?.name ?? '',
      dayOfWeek: planMovement.day_of_week,
      routines: planMovement.plan_routines.map((routine) => ({
        week: routine.week,
        setNumber: routine.set_number,
        percentagePr: parseFloat(routine.percentage_pr),
        repetitions: routine.repetitions,
      })),
    })),
  };
}

export async function getAllPlanDetails(): Promise<PlanDetail[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('plans')
    .select(`
      id, name, description, length_weeks, is_system, slug, evaluation_week,
      plan_movements(
        id, day_of_week, movement_id,
        movements(name),
        plan_routines(week, set_number, percentage_pr, repetitions)
      )
    `)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => toPlanDetail(row as unknown as PlanRow));
}
