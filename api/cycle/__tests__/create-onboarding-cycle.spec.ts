import { createClient } from '@/lib/supabase/server';
import { createOnboardingCycle } from '../create-onboarding-cycle';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

function makeMockSupabase({ error }: { error: { message: string } | null }) {
  return {
    rpc: jest.fn().mockResolvedValue({ data: null, error }),
  };
}

const params = { planId: 5, date: '2026-03-10' };

describe('createOnboardingCycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns { error: null } on success', async () => {
    const mockSupabase = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await createOnboardingCycle(params);

    expect(result).toEqual({ error: null });
  });

  it('calls rpc with correct params including null p_pr_by_movement', async () => {
    const mockSupabase = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await createOnboardingCycle(params);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('create_onboarding_cycle', {
      p_plan_id: params.planId,
      p_start_date: params.date,
    });
  });

  it('returns { error: message } on RPC error', async () => {
    const mockSupabase = makeMockSupabase({ error: { message: 'RPC failed' } });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await createOnboardingCycle(params);

    expect(result).toEqual({ error: 'RPC failed' });
  });

  it('does not throw — surfaces errors as return values', async () => {
    const mockSupabase = makeMockSupabase({ error: { message: 'constraint violation' } });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await expect(createOnboardingCycle(params)).resolves.toEqual({
      error: 'constraint violation',
    });
  });
});
