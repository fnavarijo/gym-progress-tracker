'use server';

import { createClient } from '@/lib/supabase/server';
import { CreatePlanInput } from './create-plan';
import { validatePlanInput } from './validate-plan-input';

export async function updatePlan(
  planId: number,
  input: CreatePlanInput,
): Promise<{ error: string | null }> {
  const validationError = validatePlanInput(input);
  if (validationError) return { error: validationError };

  const supabase = await createClient();

  // Step 1: Update plan fields
  const { error: planError } = await supabase
    .from('plans')
    .update({ name: input.name, description: input.description, length_weeks: input.lengthWeeks })
    .eq('id', planId);

  if (planError) return { error: planError.message };

  // Step 2: Fetch existing plan_movement ids for this plan
  const { data: existingMovements, error: fetchError } = await supabase
    .from('plan_movements')
    .select('id')
    .eq('plan_id', planId);

  if (fetchError) return { error: fetchError.message };

  const existingIds = (existingMovements ?? []).map((row: { id: number }) => row.id);

  // Step 3: Delete plan_routines for those movements (explicit — no cascade assumption)
  if (existingIds.length > 0) {
    const { error: routinesDeleteError } = await supabase
      .from('plan_routines')
      .delete()
      .in('plan_movement_id', existingIds);

    if (routinesDeleteError) return { error: routinesDeleteError.message };
  }

  // Step 4: Delete plan_movements
  const { error: movementsDeleteError } = await supabase
    .from('plan_movements')
    .delete()
    .eq('plan_id', planId);

  if (movementsDeleteError) return { error: movementsDeleteError.message };

  // Step 5: Insert new plan_movements
  const { data: newMovements, error: movementsInsertError } = await supabase
    .from('plan_movements')
    .insert(
      input.movements.map((movement) => ({
        plan_id: planId,
        movement_id: movement.movementId,
        day_of_week: movement.dayOfWeek,
      })),
    )
    .select('id, day_of_week');

  if (movementsInsertError) return { error: movementsInsertError.message };

  const dayToPlanMovementId = new Map<number, number>(
    (newMovements as Array<{ id: number; day_of_week: number }>).map((row) => [
      row.day_of_week,
      row.id,
    ]),
  );

  // Step 6: Insert new plan_routines
  const { error: routinesInsertError } = await supabase
    .from('plan_routines')
    .insert(
      input.routines.map((routine) => ({
        plan_movement_id: dayToPlanMovementId.get(routine.dayOfWeek)!,
        week: routine.week,
        set_number: routine.setNumber,
        percentage_pr: routine.percentagePr,
        repetitions: routine.repetitions,
      })),
    );

  if (routinesInsertError) return { error: routinesInsertError.message };

  return { error: null };
}
