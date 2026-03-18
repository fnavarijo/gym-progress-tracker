import { CreatePlanInput } from './create-plan';

export function validatePlanInput(input: CreatePlanInput): string | null {
  if (input.movements.length === 0) {
    return 'Plan must include at least one movement.';
  }

  for (const routine of input.routines) {
    if (routine.week > input.lengthWeeks) {
      return `Routine week ${routine.week} exceeds plan length of ${input.lengthWeeks} weeks.`;
    }
  }

  const coveredWeeks = new Set(input.routines.map((routine) => routine.week));
  for (let week = 1; week <= input.lengthWeeks; week++) {
    if (!coveredWeeks.has(week)) {
      return `Week ${week} has no routines defined.`;
    }
  }

  return null;
}
