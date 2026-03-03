import { createClient } from '@/lib/supabase/server';
import { updateWorkout } from '../update-workout';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

function makeMockSupabase({ error }: { error: unknown }) {
  const eq     = jest.fn().mockResolvedValue({ data: null, error });
  const update = jest.fn().mockReturnValue({ eq });
  const from   = jest.fn().mockReturnValue({ update });

  return { from, _mocks: { update, eq } };
}

describe('updateWorkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns { error: null } on success', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await updateWorkout(1);

    expect(result).toEqual({ error: null });
  });

  it('returns { error: message } when Supabase returns an error — does not throw', async () => {
    const mock = makeMockSupabase({ error: { message: 'permission denied', code: '42501' } });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await updateWorkout(1);

    expect(result).toEqual({ error: 'permission denied' });
  });

  it('calls .eq("id", workoutId) with the exact workout ID passed in', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    await updateWorkout(42);

    expect(mock._mocks.eq).toHaveBeenCalledWith('id', 42);
  });

  it('calls .update({ completed_at: <valid ISO string> })', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    const before = Date.now();
    await updateWorkout(1);
    const after = Date.now();

    const [updateArg] = mock._mocks.update.mock.calls[0] as [{ completed_at: string }][];
    expect(typeof updateArg.completed_at).toBe('string');
    const ts = new Date(updateArg.completed_at).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});
