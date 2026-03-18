import { createClient } from '@/lib/supabase/server';
import { updatePlan } from '../update-plan';
import { CreatePlanInput } from '../create-plan';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

const validInput: CreatePlanInput = {
  name: 'Updated Plan',
  description: 'New description',
  lengthWeeks: 1,
  movements: [
    { movementId: 1, dayOfWeek: 1 },
    { movementId: 2, dayOfWeek: 3 },
  ],
  routines: [
    { dayOfWeek: 1, week: 1, setNumber: 1, percentagePr: 0.75, repetitions: 5 },
    { dayOfWeek: 3, week: 1, setNumber: 1, percentagePr: 0.7, repetitions: 5 },
  ],
};

function makeSuccessMockSupabase() {
  const from = jest.fn()
    // Step 1: update plans
    .mockReturnValueOnce({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    })
    // Step 2: select existing plan_movements ids
    .mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [{ id: 10 }, { id: 11 }], error: null }),
      }),
    })
    // Step 3: delete plan_routines
    .mockReturnValueOnce({
      delete: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({ error: null }),
      }),
    })
    // Step 4: delete plan_movements
    .mockReturnValueOnce({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    })
    // Step 5: insert new plan_movements
    .mockReturnValueOnce({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: 20, day_of_week: 1 }, { id: 21, day_of_week: 3 }],
          error: null,
        }),
      }),
    })
    // Step 6: insert new plan_routines
    .mockReturnValueOnce({
      insert: jest.fn().mockResolvedValue({ error: null }),
    });

  return { from };
}

describe('updatePlan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns { error: null } on full success', async () => {
    const mockSupabase = makeSuccessMockSupabase();
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await updatePlan(99, validInput);

    expect(result).toEqual({ error: null });
  });

  it('updates plan row with correct fields', async () => {
    const mockSupabase = makeSuccessMockSupabase();
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await updatePlan(99, validInput);

    expect(mockSupabase.from).toHaveBeenNthCalledWith(1, 'plans');
    const updateFn = mockSupabase.from.mock.results[0].value.update;
    expect(updateFn).toHaveBeenCalledWith({
      name: 'Updated Plan',
      description: 'New description',
      length_weeks: 1,
    });
    const eqFn = updateFn.mock.results[0].value.eq;
    expect(eqFn).toHaveBeenCalledWith('id', 99);
  });

  it('fetches existing plan_movements to get ids for deletion', async () => {
    const mockSupabase = makeSuccessMockSupabase();
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await updatePlan(99, validInput);

    expect(mockSupabase.from).toHaveBeenNthCalledWith(2, 'plan_movements');
    const selectFn = mockSupabase.from.mock.results[1].value.select;
    expect(selectFn).toHaveBeenCalledWith('id');
    const eqFn = selectFn.mock.results[0].value.eq;
    expect(eqFn).toHaveBeenCalledWith('plan_id', 99);
  });

  it('deletes plan_routines by existing movement ids', async () => {
    const mockSupabase = makeSuccessMockSupabase();
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await updatePlan(99, validInput);

    expect(mockSupabase.from).toHaveBeenNthCalledWith(3, 'plan_routines');
    const deleteFn = mockSupabase.from.mock.results[2].value.delete;
    const inFn = deleteFn.mock.results[0].value.in;
    expect(inFn).toHaveBeenCalledWith('plan_movement_id', [10, 11]);
  });

  it('deletes plan_movements by plan_id', async () => {
    const mockSupabase = makeSuccessMockSupabase();
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await updatePlan(99, validInput);

    expect(mockSupabase.from).toHaveBeenNthCalledWith(4, 'plan_movements');
    const deleteFn = mockSupabase.from.mock.results[3].value.delete;
    const eqFn = deleteFn.mock.results[0].value.eq;
    expect(eqFn).toHaveBeenCalledWith('plan_id', 99);
  });

  it('inserts new plan_movements and plan_routines', async () => {
    const mockSupabase = makeSuccessMockSupabase();
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await updatePlan(99, validInput);

    const movementsInsert = mockSupabase.from.mock.results[4].value.insert;
    expect(movementsInsert).toHaveBeenCalledWith([
      { plan_id: 99, movement_id: 1, day_of_week: 1 },
      { plan_id: 99, movement_id: 2, day_of_week: 3 },
    ]);

    const routinesInsert = mockSupabase.from.mock.results[5].value.insert;
    expect(routinesInsert).toHaveBeenCalledWith([
      { plan_movement_id: 20, week: 1, set_number: 1, percentage_pr: 0.75, repetitions: 5 },
      { plan_movement_id: 21, week: 1, set_number: 1, percentage_pr: 0.7, repetitions: 5 },
    ]);
  });

  it('skips plan_routines delete when no existing movements', async () => {
    const from = jest.fn()
      .mockReturnValueOnce({
        update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      })
      // Step 4: delete plan_movements (step 3 is skipped)
      .mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
      })
      .mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ id: 20, day_of_week: 1 }, { id: 21, day_of_week: 3 }],
            error: null,
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

    mockCreateClient.mockResolvedValue({ from } as never);

    const result = await updatePlan(99, validInput);

    expect(result).toEqual({ error: null });
    // Only 5 from calls: update plan, select movements, delete movements, insert movements, insert routines
    expect(from).toHaveBeenCalledTimes(5);
  });

  it('returns error without calling Supabase when movements is empty', async () => {
    const result = await updatePlan(99, { ...validInput, movements: [] });

    expect(result.error).not.toBeNull();
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it('returns error without calling Supabase when a routine week exceeds lengthWeeks', async () => {
    const result = await updatePlan(99, {
      ...validInput,
      routines: [{ dayOfWeek: 1, week: 99, setNumber: 1, percentagePr: 0.75, repetitions: 5 }],
    });

    expect(result.error).not.toBeNull();
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it('returns error without calling Supabase when a week has no routines', async () => {
    const result = await updatePlan(99, {
      ...validInput,
      lengthWeeks: 2,
      routines: [{ dayOfWeek: 1, week: 1, setNumber: 1, percentagePr: 0.75, repetitions: 5 }],
    });

    expect(result.error).not.toBeNull();
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it('returns error when plan update fails', async () => {
    const from = jest.fn().mockReturnValueOnce({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: 'update failed' } }),
      }),
    });
    mockCreateClient.mockResolvedValue({ from } as never);

    const result = await updatePlan(99, validInput);

    expect(result).toEqual({ error: 'update failed' });
  });

  it('returns error when fetch existing movements fails', async () => {
    const from = jest.fn()
      .mockReturnValueOnce({
        update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'fetch failed' } }),
        }),
      });
    mockCreateClient.mockResolvedValue({ from } as never);

    const result = await updatePlan(99, validInput);

    expect(result).toEqual({ error: 'fetch failed' });
  });

  it('returns error when plan_routines delete fails', async () => {
    const from = jest.fn()
      .mockReturnValueOnce({
        update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [{ id: 10 }], error: null }),
        }),
      })
      .mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ error: { message: 'routines delete failed' } }),
        }),
      });
    mockCreateClient.mockResolvedValue({ from } as never);

    const result = await updatePlan(99, validInput);

    expect(result).toEqual({ error: 'routines delete failed' });
  });
});
