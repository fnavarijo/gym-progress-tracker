import { createClient } from '@/lib/supabase/server';
import { hasUserPastCycles } from '../has-user-past-cycles';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

function makeMockSupabase({
  user,
  data,
  error,
}: {
  user: object | null;
  data: object | null;
  error: object | null;
}) {
  const maybeSingle = jest.fn().mockResolvedValue({ data, error });
  const limit = jest.fn().mockReturnValue({ maybeSingle });
  const in_ = jest.fn().mockReturnValue({ limit });
  const eq = jest.fn().mockReturnValue({ in: in_ });
  const select = jest.fn().mockReturnValue({ eq });
  const from = jest.fn().mockReturnValue({ select });

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user } }),
    },
    from,
  };
}

const mockUser = { id: 'user-123' };

describe('hasUserPastCycles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns true when user has at least one completed/archived cycle', async () => {
    const mockSupabase = makeMockSupabase({ user: mockUser, data: { id: 1 }, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await hasUserPastCycles();

    expect(result).toBe(true);
  });

  it('returns false when user has no completed/archived cycles', async () => {
    const mockSupabase = makeMockSupabase({ user: mockUser, data: null, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await hasUserPastCycles();

    expect(result).toBe(false);
  });

  it('returns false when user is not authenticated', async () => {
    const mockSupabase = makeMockSupabase({ user: null, data: null, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await hasUserPastCycles();

    expect(result).toBe(false);
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it('throws on DB error', async () => {
    const pgError = { message: 'DB failure', code: '42P01' };
    const mockSupabase = makeMockSupabase({ user: mockUser, data: null, error: pgError });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await expect(hasUserPastCycles()).rejects.toEqual(pgError);
  });
});
