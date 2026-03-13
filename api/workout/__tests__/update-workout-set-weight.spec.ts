import { createClient } from '@/lib/supabase/server';
import { updateWorkoutSetWeight } from '../update-workout-set-weight';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

function makeMockSupabase({ error }: { error: unknown }) {
  const eq     = jest.fn().mockResolvedValue({ data: null, error });
  const update = jest.fn().mockReturnValue({ eq });
  const from   = jest.fn().mockReturnValue({ update });

  return { from, _mocks: { update, eq } };
}

describe('updateWorkoutSetWeight', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns { error: null } on success', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await updateWorkoutSetWeight(1, 135);

    expect(result).toEqual({ error: null });
  });

  it('returns { error: message } when Supabase returns an error — does not throw', async () => {
    const mock = makeMockSupabase({ error: { message: 'permission denied', code: '42501' } });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await updateWorkoutSetWeight(1, 135);

    expect(result).toEqual({ error: 'permission denied' });
  });

  it('calls .eq("id", setId) with the exact set ID passed in', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    await updateWorkoutSetWeight(42, 100);

    expect(mock._mocks.eq).toHaveBeenCalledWith('id', 42);
  });

  it('calls .update({ used_weight }) with the correct weight — does NOT include completed_at', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    await updateWorkoutSetWeight(1, 185);

    const [updateArg] = mock._mocks.update.mock.calls[0] as [Record<string, unknown>][];
    expect(updateArg.used_weight).toBe(185);
    expect(updateArg).not.toHaveProperty('completed_at');
  });

  it('calls .from("workout_sets")', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    await updateWorkoutSetWeight(1, 100);

    expect(mock.from).toHaveBeenCalledWith('workout_sets');
  });
});
