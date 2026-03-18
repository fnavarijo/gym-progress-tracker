import { createClient } from '@/lib/supabase/server';
import { createPlan, CreatePlanInput } from '../create-plan';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

const validInput: CreatePlanInput = {
  name: 'Strength Block A',
  description: 'Focus on big lifts',
  lengthWeeks: 1,
  slug: 'strength-block-a',
  isSystem: false,
  evaluationWeek: 1,
  movements: [
    { movementId: 1, dayOfWeek: 1 },
    { movementId: 2, dayOfWeek: 3 },
  ],
  routines: [
    { dayOfWeek: 1, week: 1, setNumber: 1, percentagePr: 0.75, repetitions: 5 },
    { dayOfWeek: 1, week: 1, setNumber: 2, percentagePr: 0.8, repetitions: 3 },
    { dayOfWeek: 3, week: 1, setNumber: 1, percentagePr: 0.7, repetitions: 5 },
  ],
};

function makeSuccessMockSupabase() {
  const from = jest.fn()
    .mockReturnValueOnce({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [{ id: 99 }], error: null }),
      }),
    })
    .mockReturnValueOnce({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [
            { id: 10, day_of_week: 1 },
            { id: 11, day_of_week: 3 },
          ],
          error: null,
        }),
      }),
    })
    .mockReturnValueOnce({
      insert: jest.fn().mockResolvedValue({ error: null }),
    });

  return { from };
}

describe('createPlan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns { error: null } on successful insert', async () => {
    const mockSupabase = makeSuccessMockSupabase();
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await createPlan(validInput);

    expect(result).toEqual({ error: null });
  });

  it('inserts plan with correct fields', async () => {
    const mockSupabase = makeSuccessMockSupabase();
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await createPlan(validInput);

    const planInsert = mockSupabase.from.mock.calls[0];
    expect(planInsert[0]).toBe('plans');
    const insertFn = mockSupabase.from.mock.results[0].value.insert;
    expect(insertFn).toHaveBeenCalledWith({
      name: 'Strength Block A',
      description: 'Focus on big lifts',
      length_weeks: 1,
      slug: 'strength-block-a',
      is_system: false,
      evaluation_week: 1,
    });
  });

  it('inserts plan_movements with plan_id and day_of_week', async () => {
    const mockSupabase = makeSuccessMockSupabase();
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await createPlan(validInput);

    const planMovementsInsert = mockSupabase.from.mock.results[1].value.insert;
    expect(planMovementsInsert).toHaveBeenCalledWith([
      { plan_id: 99, movement_id: 1, day_of_week: 1 },
      { plan_id: 99, movement_id: 2, day_of_week: 3 },
    ]);
  });

  it('inserts plan_routines using plan_movement_id map', async () => {
    const mockSupabase = makeSuccessMockSupabase();
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await createPlan(validInput);

    const routinesInsert = mockSupabase.from.mock.results[2].value.insert;
    expect(routinesInsert).toHaveBeenCalledWith([
      { plan_movement_id: 10, week: 1, set_number: 1, percentage_pr: 0.75, repetitions: 5 },
      { plan_movement_id: 10, week: 1, set_number: 2, percentage_pr: 0.8, repetitions: 3 },
      { plan_movement_id: 11, week: 1, set_number: 1, percentage_pr: 0.7, repetitions: 5 },
    ]);
  });

  it('returns error message when plans insert fails', async () => {
    const from = jest.fn().mockReturnValueOnce({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: null, error: { message: 'plans insert failed' } }),
      }),
    });
    mockCreateClient.mockResolvedValue({ from } as never);

    const result = await createPlan(validInput);

    expect(result).toEqual({ error: 'plans insert failed' });
  });

  it('returns error message when plan_movements insert fails', async () => {
    const from = jest.fn()
      .mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ data: [{ id: 99 }], error: null }),
        }),
      })
      .mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ data: null, error: { message: 'movements insert failed' } }),
        }),
      });
    mockCreateClient.mockResolvedValue({ from } as never);

    const result = await createPlan(validInput);

    expect(result).toEqual({ error: 'movements insert failed' });
  });

  it('returns error without calling Supabase when movements is empty', async () => {
    const result = await createPlan({ ...validInput, movements: [] });

    expect(result.error).not.toBeNull();
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it('returns error without calling Supabase when a routine week exceeds lengthWeeks', async () => {
    const result = await createPlan({
      ...validInput,
      routines: [{ dayOfWeek: 1, week: 99, setNumber: 1, percentagePr: 0.75, repetitions: 5 }],
    });

    expect(result.error).not.toBeNull();
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it('returns error without calling Supabase when a week has no routines', async () => {
    const result = await createPlan({
      ...validInput,
      lengthWeeks: 2,
      routines: [{ dayOfWeek: 1, week: 1, setNumber: 1, percentagePr: 0.75, repetitions: 5 }],
    });

    expect(result.error).not.toBeNull();
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it('returns error message when plan_routines insert fails', async () => {
    const from = jest.fn()
      .mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ data: [{ id: 99 }], error: null }),
        }),
      })
      .mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ id: 10, day_of_week: 1 }, { id: 11, day_of_week: 3 }],
            error: null,
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({ error: { message: 'routines insert failed' } }),
      });
    mockCreateClient.mockResolvedValue({ from } as never);

    const result = await createPlan(validInput);

    expect(result).toEqual({ error: 'routines insert failed' });
  });
});
