import { createClient } from '@/lib/supabase/server';
import { getCycleWorkouts } from '../get-cycle-workouts';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

function makeMockSupabase(result: { data: unknown; error: unknown }) {
  const secondOrder = jest.fn().mockResolvedValue(result);
  const firstOrder  = jest.fn().mockReturnValue({ order: secondOrder });
  const eq          = jest.fn().mockReturnValue({ order: firstOrder });
  const select      = jest.fn().mockReturnValue({ eq });
  const from        = jest.fn().mockReturnValue({ select });

  return { from, _mocks: { secondOrder, firstOrder, eq, select } };
}

const workoutRows = [
  {
    id: 1,
    week: 1,
    completed_at: '2026-01-05T10:00:00Z',
    cycle_movements: { cycle_id: 10, movements: { name: 'Back Squat' } },
  },
  {
    id: 2,
    week: 1,
    completed_at: null,
    cycle_movements: { cycle_id: 10, movements: { name: 'Deadlift' } },
  },
  {
    id: 3,
    week: 2,
    completed_at: '2026-01-12T10:00:00Z',
    cycle_movements: { cycle_id: 10, movements: { name: 'Back Squat' } },
  },
];

describe('getCycleWorkouts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns mapped CycleWorkout[] for a valid cycleId', async () => {
    const mockSupabase = makeMockSupabase({ data: workoutRows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getCycleWorkouts(10);

    expect(result).toEqual([
      { id: 1, week: 1, name: 'Back Squat', completed: true,  completedAt: '2026-01-05T10:00:00Z' },
      { id: 2, week: 1, name: 'Deadlift',   completed: false, completedAt: null },
      { id: 3, week: 2, name: 'Back Squat', completed: true,  completedAt: '2026-01-12T10:00:00Z' },
    ]);
  });

  it('sets completed: true when completed_at is non-null', async () => {
    const rows = [
      {
        id: 5,
        week: 1,
        completed_at: '2026-01-10T08:00:00Z',
        cycle_movements: { cycle_id: 1, movements: { name: 'Strict Press' } },
      },
    ];
    const mockSupabase = makeMockSupabase({ data: rows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getCycleWorkouts(1);

    expect(result[0].completed).toBe(true);
    expect(result[0].completedAt).toBe('2026-01-10T08:00:00Z');
  });

  it('sets completed: false when completed_at is null', async () => {
    const rows = [
      {
        id: 6,
        week: 2,
        completed_at: null,
        cycle_movements: { cycle_id: 2, movements: { name: 'Front Squat' } },
      },
    ];
    const mockSupabase = makeMockSupabase({ data: rows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getCycleWorkouts(2);

    expect(result[0].completed).toBe(false);
    expect(result[0].completedAt).toBeNull();
  });

  it('returns [] when no rows exist', async () => {
    const mockSupabase = makeMockSupabase({ data: [], error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getCycleWorkouts(99);

    expect(result).toEqual([]);
  });

  it('throws on DB error', async () => {
    const pgError = { message: 'DB failure', code: '42P01' };
    const mockSupabase = makeMockSupabase({ data: null, error: pgError });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await expect(getCycleWorkouts(1)).rejects.toEqual(pgError);
  });

  it('calls eq with the cycleId passed in', async () => {
    const mockSupabase = makeMockSupabase({ data: [], error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await getCycleWorkouts(42);

    expect(mockSupabase._mocks.eq).toHaveBeenCalledWith('cycle_movements.cycle_id', 42);
  });

  it('orders by week then by id', async () => {
    const mockSupabase = makeMockSupabase({ data: [], error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await getCycleWorkouts(1);

    expect(mockSupabase._mocks.firstOrder).toHaveBeenCalledWith('week');
    expect(mockSupabase._mocks.secondOrder).toHaveBeenCalledWith('id');
  });
});
