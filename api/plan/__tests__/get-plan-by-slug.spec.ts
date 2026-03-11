import { createClient } from '@/lib/supabase/server';
import { getPlanBySlug } from '../get-plan-by-slug';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

function makeMockSupabase({
  data,
  error,
}: {
  data: object | null;
  error: object | null;
}) {
  const maybeSingle = jest.fn().mockResolvedValue({ data, error });
  const eq = jest.fn().mockReturnValue({ maybeSingle });
  const select = jest.fn().mockReturnValue({ eq });
  const from = jest.fn().mockReturnValue({ select });

  return { from };
}

const planRow = { id: 5, name: 'Onboarding' };

describe('getPlanBySlug', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns plan { id, name } when slug matches', async () => {
    const mockSupabase = makeMockSupabase({ data: planRow, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getPlanBySlug('onboarding');

    expect(result).toEqual({ id: 5, name: 'Onboarding' });
  });

  it('queries with the provided slug', async () => {
    const mockSupabase = makeMockSupabase({ data: planRow, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await getPlanBySlug('onboarding');

    expect(mockSupabase.from).toHaveBeenCalledWith('plans');
    const eq = mockSupabase.from.mock.results[0].value.select.mock.results[0].value.eq;
    expect(eq).toHaveBeenCalledWith('slug', 'onboarding');
  });

  it('returns null when not found', async () => {
    const mockSupabase = makeMockSupabase({ data: null, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getPlanBySlug('onboarding');

    expect(result).toBeNull();
  });

  it('throws on DB error', async () => {
    const pgError = { message: 'DB failure', code: '42P01' };
    const mockSupabase = makeMockSupabase({ data: null, error: pgError });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await expect(getPlanBySlug('onboarding')).rejects.toEqual(pgError);
  });
});
