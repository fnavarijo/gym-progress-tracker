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

  if (!input.slug || input.slug.trim() === '') {
    return 'Plan slug is required.';
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    return 'Plan slug may only contain lowercase letters, numbers, and hyphens.';
  }

  if (input.evaluationWeek < 1 || input.evaluationWeek > input.lengthWeeks) {
    return `Evaluation week must be between 1 and ${input.lengthWeeks}.`;
  }

  return null;
}
