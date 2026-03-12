import { createClient } from '@/lib/supabase/server';
import { getLastCycleEvalResults } from '../get-last-cycle-eval-results';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

const mockUser = { id: 'user-123' };

function makeMockSupabase({
  user,
  cycleData,
  cycleError,
  movementsData,
  movementsError,
}: {
  user: object | null;
  cycleData: object | null;
  cycleError: object | null;
  movementsData: object[] | null;
  movementsError: object | null;
}) {
  const maybeSingle = jest.fn().mockResolvedValue({ data: cycleData, error: cycleError });
  const limit = jest.fn().mockReturnValue({ maybeSingle });
  const order = jest.fn().mockReturnValue({ limit });
  const eqStatus = jest.fn().mockReturnValue({ order });
  const eqUserId = jest.fn().mockReturnValue({ eq: eqStatus });
  const cycleSelect = jest.fn().mockReturnValue({ eq: eqUserId });

  const movementsEq = jest.fn().mockResolvedValue({ data: movementsData, error: movementsError });
  const movementsSelect = jest.fn().mockReturnValue({ eq: movementsEq });

  const from = jest.fn().mockImplementation((table: string) => {
    if (table === 'cycles') return { select: cycleSelect };
    if (table === 'cycle_movements') return { select: movementsSelect };
    return {};
  });

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user } }),
    },
    from,
  };
}

describe('getLastCycleEvalResults', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns mapped EvalResult[] when last completed cycle has eval results', async () => {
    const mockSupabase = makeMockSupabase({
      user: mockUser,
      cycleData: { id: 42 },
      cycleError: null,
      movementsData: [
        {
          movement_id: 1,
          movements: { id: 1, name: 'Squat' },
          evaluation_results: { used_weight: '200.5' },
        },
        {
          movement_id: 2,
          movements: { id: 2, name: 'Bench Press' },
          evaluation_results: { used_weight: '135' },
        },
      ],
      movementsError: null,
    });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getLastCycleEvalResults();

    expect(result).toEqual([
      { movementId: 1, movementName: 'Squat', usedWeight: 200.5 },
      { movementId: 2, movementName: 'Bench Press', usedWeight: 135 },
    ]);
  });

  it('returns [] when last completed cycle exists but has no eval results', async () => {
    const mockSupabase = makeMockSupabase({
      user: mockUser,
      cycleData: { id: 42 },
      cycleError: null,
      movementsData: [],
      movementsError: null,
    });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getLastCycleEvalResults();

    expect(result).toEqual([]);
  });

  it('returns [] when user has no completed cycles', async () => {
    const mockSupabase = makeMockSupabase({
      user: mockUser,
      cycleData: null,
      cycleError: null,
      movementsData: null,
      movementsError: null,
    });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getLastCycleEvalResults();

    expect(result).toEqual([]);
    expect(mockSupabase.from).toHaveBeenCalledTimes(1); // only cycles query
  });

  it('returns [] when user is unauthenticated', async () => {
    const mockSupabase = makeMockSupabase({
      user: null,
      cycleData: null,
      cycleError: null,
      movementsData: null,
      movementsError: null,
    });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getLastCycleEvalResults();

    expect(result).toEqual([]);
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it('throws on DB error from cycles query', async () => {
    const pgError = { message: 'DB failure', code: '42P01' };
    const mockSupabase = makeMockSupabase({
      user: mockUser,
      cycleData: null,
      cycleError: pgError,
      movementsData: null,
      movementsError: null,
    });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await expect(getLastCycleEvalResults()).rejects.toEqual(pgError);
  });

  it('throws on DB error from cycle_movements query', async () => {
    const pgError = { message: 'Movements query failed', code: '42P01' };
    const mockSupabase = makeMockSupabase({
      user: mockUser,
      cycleData: { id: 42 },
      cycleError: null,
      movementsData: null,
      movementsError: pgError,
    });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await expect(getLastCycleEvalResults()).rejects.toEqual(pgError);
  });
});
