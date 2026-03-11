import { createClient } from '@/lib/supabase/server';
import { getOrCreateWorkout } from '../get-or-create-workout';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

function makeMockSupabase(result: { data: unknown; error: unknown }) {
  const rpc = jest.fn().mockResolvedValue(result);
  return { rpc, _mocks: { rpc } };
}

const mockRows = [
  {
    out_workout_id: 69,
    out_is_evaluation: true,
    out_plan_routine_id: 67,
    out_set_number: 1,
    out_scheduled_weight: null,
    out_completed_at: null,
  },
  {
    out_workout_id: 69,
    out_is_evaluation: true,
    out_plan_routine_id: 68,
    out_set_number: 2,
    out_scheduled_weight: '100.5',
    out_completed_at: null,
  },
];

describe('getOrCreateWorkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls rpc with correct params', async () => {
    const mockSupabase = makeMockSupabase({ data: mockRows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await getOrCreateWorkout(7, 2);

    expect(mockSupabase._mocks.rpc).toHaveBeenCalledWith('get_or_create_workout', {
      p_cycle_movement_id: 7,
      p_week: 2,
    });
  });

  it('returns workoutId and isEvaluation from first row', async () => {
    const mockSupabase = makeMockSupabase({ data: mockRows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getOrCreateWorkout(3, 1);

    expect(result.workoutId).toBe(69);
    expect(result.isEvaluation).toBe(true);
  });

  it('maps sets from all rows', async () => {
    const mockSupabase = makeMockSupabase({ data: mockRows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getOrCreateWorkout(3, 1);

    expect(result.sets).toEqual([
      { planRoutineId: 67, setNumber: 1, scheduledWeight: null, completedAt: null },
      { planRoutineId: 68, setNumber: 2, scheduledWeight: 100.5, completedAt: null },
    ]);
  });

  it('throws on RPC error', async () => {
    const pgError = { message: 'RPC failure', code: 'PGRST301' };
    const mockSupabase = makeMockSupabase({ data: null, error: pgError });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await expect(getOrCreateWorkout(1, 1)).rejects.toEqual(pgError);
  });
});
