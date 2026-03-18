import { validatePlanInput } from '../validate-plan-input';
import { CreatePlanInput } from '../create-plan';

function makeInput(overrides: Partial<CreatePlanInput> = {}): CreatePlanInput {
  return {
    name: 'Test Plan',
    description: null,
    lengthWeeks: 2,
    movements: [{ movementId: 1, dayOfWeek: 1 }],
    routines: [
      { dayOfWeek: 1, week: 1, setNumber: 1, percentagePr: 0.75, repetitions: 5 },
      { dayOfWeek: 1, week: 2, setNumber: 1, percentagePr: 0.8, repetitions: 5 },
    ],
    ...overrides,
  };
}

describe('validatePlanInput', () => {
  it('returns null for valid input with all weeks covered', () => {
    expect(validatePlanInput(makeInput())).toBeNull();
  });

  it('returns error when movements array is empty', () => {
    const result = validatePlanInput(makeInput({ movements: [] }));
    expect(result).toBe('Plan must include at least one movement.');
  });

  it('returns null for exactly 1 movement (boundary)', () => {
    expect(validatePlanInput(makeInput({ movements: [{ movementId: 1, dayOfWeek: 1 }] }))).toBeNull();
  });

  it('returns error when a routine week exceeds lengthWeeks', () => {
    const result = validatePlanInput(
      makeInput({
        lengthWeeks: 2,
        routines: [
          { dayOfWeek: 1, week: 1, setNumber: 1, percentagePr: 0.75, repetitions: 5 },
          { dayOfWeek: 1, week: 3, setNumber: 1, percentagePr: 0.8, repetitions: 5 },
        ],
      }),
    );
    expect(result).toBe('Routine week 3 exceeds plan length of 2 weeks.');
  });

  it('returns null when routine week equals lengthWeeks (boundary)', () => {
    expect(validatePlanInput(makeInput())).toBeNull();
  });

  it('returns error when week 1 is missing from routines', () => {
    const result = validatePlanInput(
      makeInput({
        lengthWeeks: 2,
        routines: [
          { dayOfWeek: 1, week: 2, setNumber: 1, percentagePr: 0.8, repetitions: 5 },
        ],
      }),
    );
    expect(result).toBe('Week 1 has no routines defined.');
  });

  it('returns error when a middle week is missing', () => {
    const result = validatePlanInput(
      makeInput({
        lengthWeeks: 3,
        routines: [
          { dayOfWeek: 1, week: 1, setNumber: 1, percentagePr: 0.7, repetitions: 5 },
          { dayOfWeek: 1, week: 3, setNumber: 1, percentagePr: 0.85, repetitions: 3 },
        ],
      }),
    );
    expect(result).toBe('Week 2 has no routines defined.');
  });

  it('returns error when the last week is missing', () => {
    const result = validatePlanInput(
      makeInput({
        lengthWeeks: 3,
        routines: [
          { dayOfWeek: 1, week: 1, setNumber: 1, percentagePr: 0.7, repetitions: 5 },
          { dayOfWeek: 1, week: 2, setNumber: 1, percentagePr: 0.8, repetitions: 5 },
        ],
      }),
    );
    expect(result).toBe('Week 3 has no routines defined.');
  });

  it('returns null for multi-movement input with all weeks present', () => {
    const result = validatePlanInput(
      makeInput({
        lengthWeeks: 1,
        movements: [
          { movementId: 1, dayOfWeek: 1 },
          { movementId: 2, dayOfWeek: 3 },
        ],
        routines: [
          { dayOfWeek: 1, week: 1, setNumber: 1, percentagePr: 0.75, repetitions: 5 },
          { dayOfWeek: 3, week: 1, setNumber: 1, percentagePr: 0.7, repetitions: 5 },
        ],
      }),
    );
    expect(result).toBeNull();
  });

  it('returns empty-movements error before week-range check (priority order)', () => {
    const result = validatePlanInput(
      makeInput({
        movements: [],
        routines: [
          { dayOfWeek: 1, week: 999, setNumber: 1, percentagePr: 0.75, repetitions: 5 },
        ],
      }),
    );
    expect(result).toBe('Plan must include at least one movement.');
  });
});
