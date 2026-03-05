import { createClient } from '@/lib/supabase/server';
import { getUserActiveCycle } from '../get-user-active-cycle';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

function makeMockSupabase({
  user,
  cycleData,
  cycleError,
}: {
  user: object | null;
  cycleData: object | null;
  cycleError: object | null;
}) {
  const maybeSingle = jest.fn().mockResolvedValue({ data: cycleData, error: cycleError });
  const eq = jest.fn().mockReturnValue({ maybeSingle });
  const select = jest.fn().mockReturnValue({ eq });
  const from = jest.fn().mockReturnValue({ select });

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user } }),
    },
    from,
  };
}

const cycleRow = {
  id: 1,
  user_id: 'user-123',
  plan_id: 42,
  start_date: '2026-01-01',
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
  end_date: '2026-02-11',
  current_week: 3,
  total_weeks: 6,
  days_remaining: 21,
};

const mockUser = { id: 'user-123' };

describe('getUserActiveCycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns active cycle transformed to camelCase', async () => {
    const mockSupabase = makeMockSupabase({ user: mockUser, cycleData: cycleRow, cycleError: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getUserActiveCycle();

    expect(result).toEqual({
      id: 1,
      userId: 'user-123',
      planId: 42,
      startDate: '2026-01-01',
      status: 'active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
      endDate: '2026-02-11',
      currentWeek: 3,
      totalWeeks: 6,
      daysRemaining: 21,
    });
  });

  it('returns null when no active cycle exists', async () => {
    const mockSupabase = makeMockSupabase({ user: mockUser, cycleData: null, cycleError: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getUserActiveCycle();

    expect(result).toBeNull();
  });

  it('returns null when user is not authenticated', async () => {
    const mockSupabase = makeMockSupabase({ user: null, cycleData: null, cycleError: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getUserActiveCycle();

    expect(result).toBeNull();
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it('throws on DB error', async () => {
    const pgError = { message: 'DB failure', code: '42P01' };
    const mockSupabase = makeMockSupabase({ user: mockUser, cycleData: null, cycleError: pgError });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await expect(getUserActiveCycle()).rejects.toEqual(pgError);
  });
});
