import { createClient } from '@/lib/supabase/server';
import { updateEvaluationWorkoutSet } from '../update-evaluation-workout-set';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

function makeMockSupabase({ error }: { error: unknown }) {
  const eq     = jest.fn().mockResolvedValue({ data: null, error });
  const update = jest.fn().mockReturnValue({ eq });
  const from   = jest.fn().mockReturnValue({ update });

  return { from, _mocks: { update, eq } };
}

describe('updateEvaluationWorkoutSet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns { error: null } on success', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await updateEvaluationWorkoutSet(1, 135);

    expect(result).toEqual({ error: null });
  });

  it('returns { error: message } when Supabase returns an error — does not throw', async () => {
    const mock = makeMockSupabase({ error: { message: 'permission denied', code: '42501' } });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await updateEvaluationWorkoutSet(1, 135);

    expect(result).toEqual({ error: 'permission denied' });
  });

  it('calls .eq("id", setId) with the exact set ID passed in', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    await updateEvaluationWorkoutSet(42, 100);

    expect(mock._mocks.eq).toHaveBeenCalledWith('id', 42);
  });

  it('calls .update({ used_weight, completed_at: <iso string> }) with correct weight', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    const before = Date.now();
    await updateEvaluationWorkoutSet(1, 185);
    const after = Date.now();

    const [updateArg] = mock._mocks.update.mock.calls[0] as [{ used_weight: number; completed_at: string }][];
    expect(updateArg.used_weight).toBe(185);
    expect(typeof updateArg.completed_at).toBe('string');
    const ts = new Date(updateArg.completed_at).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it('calls .from("workout_sets")', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    await updateEvaluationWorkoutSet(1, 100);

    expect(mock.from).toHaveBeenCalledWith('workout_sets');
  });
});
