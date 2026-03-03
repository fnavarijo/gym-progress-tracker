import { createClient } from '@/lib/supabase/server';
import { updateWorkoutSet } from '../update-workout-set';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

function makeMockSupabase({ error }: { error: unknown }) {
  const eq     = jest.fn().mockResolvedValue({ data: null, error });
  const update = jest.fn().mockReturnValue({ eq });
  const from   = jest.fn().mockReturnValue({ update });

  return { from, _mocks: { update, eq } };
}

describe('updateWorkoutSet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns { error: null } on success', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await updateWorkoutSet(1, true);

    expect(result).toEqual({ error: null });
  });

  it('returns { error: message } when Supabase returns an error — does not throw', async () => {
    const mock = makeMockSupabase({ error: { message: 'permission denied', code: '42501' } });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await updateWorkoutSet(1, true);

    expect(result).toEqual({ error: 'permission denied' });
  });

  it('calls .eq("id", setId) with the exact set ID passed in', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    await updateWorkoutSet(42, true);

    expect(mock._mocks.eq).toHaveBeenCalledWith('id', 42);
  });

  it('calls .update({ completed_at: <iso string> }) when completed = true', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    const before = Date.now();
    await updateWorkoutSet(1, true);
    const after = Date.now();

    const [updateArg] = mock._mocks.update.mock.calls[0] as [{ completed_at: string }][];
    expect(typeof updateArg.completed_at).toBe('string');
    const ts = new Date(updateArg.completed_at).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it('calls .update({ completed_at: null }) when completed = false', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    await updateWorkoutSet(7, false);

    expect(mock._mocks.update).toHaveBeenCalledWith({ completed_at: null });
  });
});
