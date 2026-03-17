'use server';

import { createClient } from '@/lib/supabase/server';

export interface CreatePlanMovementInput {
  movementId: number;
  dayOfWeek: number;
}

export interface CreatePlanRoutineInput {
  dayOfWeek: number;
  week: number;
  setNumber: number;
  percentagePr: number;
  repetitions: number;
}

export interface CreatePlanInput {
  name: string;
  description: string | null;
  lengthWeeks: number;
  movements: CreatePlanMovementInput[];
  routines: CreatePlanRoutineInput[];
}

export async function createPlan(input: CreatePlanInput): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Step 1: Insert the plan
  const { data: planData, error: planError } = await supabase
    .from('plans')
    .insert({
      name: input.name,
      description: input.description,
      length_weeks: input.lengthWeeks,
      is_system: false,
    })
    .select('id');

  if (planError) return { error: planError.message };

  const planId = (planData as Array<{ id: number }>)[0].id;

  // Step 2: Insert plan_movements
  const { data: planMovementsData, error: movementsError } = await supabase
    .from('plan_movements')
    .insert(
      input.movements.map((movement) => ({
        plan_id: planId,
        movement_id: movement.movementId,
        day_of_week: movement.dayOfWeek,
      }))
    )
    .select('id, day_of_week');

  if (movementsError) return { error: movementsError.message };

  // Build map from dayOfWeek to planMovementId
  const dayToPlanMovementId = new Map<number, number>(
    (planMovementsData as Array<{ id: number; day_of_week: number }>).map((row) => [
      row.day_of_week,
      row.id,
    ])
  );

  // Step 3: Insert plan_routines
  const { error: routinesError } = await supabase
    .from('plan_routines')
    .insert(
      input.routines.map((routine) => ({
        plan_movement_id: dayToPlanMovementId.get(routine.dayOfWeek)!,
        week: routine.week,
        set_number: routine.setNumber,
        percentage_pr: routine.percentagePr,
        repetitions: routine.repetitions,
      }))
    );

  if (routinesError) return { error: routinesError.message };

  return { error: null };
}
