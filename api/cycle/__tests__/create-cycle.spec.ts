import { createClient } from '@/lib/supabase/server';
import { createCycle } from '../create-cycle';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

function makeMockSupabase({ error }: { error: { message: string } | null }) {
  return {
    rpc: jest.fn().mockResolvedValue({ data: null, error }),
  };
}

const params = {
  date: '2026-03-02',
  prs: { 1: 225, 2: 315, 3: 185 } as Record<number, number>,
};

describe('createCycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns { error: null } on success', async () => {
    const mockSupabase = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await createCycle(params);

    expect(result).toEqual({ error: null });
  });

  it('calls rpc with hardcoded plan_id=1 and round_increment=5', async () => {
    const mockSupabase = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await createCycle(params);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('create_cycle_with_workouts', {
      plan_id: 1,
      date: params.date,
      prs: params.prs,
      round_increment: 5,
    });
  });

  it('returns { error: message } when rpc returns an error', async () => {
    const mockSupabase = makeMockSupabase({ error: { message: 'RPC failed' } });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await createCycle(params);

    expect(result).toEqual({ error: 'RPC failed' });
  });

  it('does not throw — surfaces errors as return values', async () => {
    const mockSupabase = makeMockSupabase({ error: { message: 'constraint violation' } });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await expect(createCycle(params)).resolves.toEqual({
      error: 'constraint violation',
    });
  });
});
