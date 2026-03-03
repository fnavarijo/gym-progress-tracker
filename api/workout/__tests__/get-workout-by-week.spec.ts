import { createClient } from '@/lib/supabase/server';
import { getWorkoutByWeek } from '../get-workout-by-week';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

function makeMockSupabase(result: { data: unknown; error: unknown }) {
  const order  = jest.fn().mockResolvedValue(result);
  const secondEq = jest.fn().mockReturnValue({ order });
  const firstEq  = jest.fn().mockReturnValue({ eq: secondEq });
  const select   = jest.fn().mockReturnValue({ eq: firstEq });
  const from     = jest.fn().mockReturnValue({ select });

  return { from, _mocks: { order, secondEq, firstEq, select } };
}

const workoutRows = [
  {
    id: 10,
    completed_at: '2026-01-05T10:00:00Z',
    cycle_movements: { cycle_id: 1, movements: { name: 'Back Squat' } },
    workout_sets: [
      { set_number: 1, scheduled_weight: 100 },
      { set_number: 2, scheduled_weight: 110 },
      { set_number: 3, scheduled_weight: 120 },
    ],
  },
  {
    id: 11,
    completed_at: null,
    cycle_movements: { cycle_id: 1, movements: { name: 'Deadlift' } },
    workout_sets: [
      { set_number: 1, scheduled_weight: 140 },
      { set_number: 2, scheduled_weight: 155 },
    ],
  },
];

describe('getWorkoutByWeek', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns mapped WorkoutEntry[] for valid cycle + week', async () => {
    const mockSupabase = makeMockSupabase({ data: workoutRows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getWorkoutByWeek(1, 1);

    expect(result).toEqual([
      { id: 10, name: 'Back Squat', topSet: 120, completed: true },
      { id: 11, name: 'Deadlift',   topSet: 155, completed: false },
    ]);
  });

  it('picks the set with the highest set_number as topSet', async () => {
    const rows = [
      {
        id: 20,
        completed_at: null,
        cycle_movements: { cycle_id: 2, movements: { name: 'Bench Press' } },
        workout_sets: [
          { set_number: 3, scheduled_weight: 90 },
          { set_number: 1, scheduled_weight: 70 },
          { set_number: 2, scheduled_weight: 80 },
        ],
      },
    ];
    const mockSupabase = makeMockSupabase({ data: rows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getWorkoutByWeek(2, 1);

    expect(result[0].topSet).toBe(90);
  });

  it('sets completed: true when completed_at is set', async () => {
    const rows = [
      {
        id: 30,
        completed_at: '2026-01-06T08:00:00Z',
        cycle_movements: { cycle_id: 3, movements: { name: 'Strict Press' } },
        workout_sets: [{ set_number: 1, scheduled_weight: 60 }],
      },
    ];
    const mockSupabase = makeMockSupabase({ data: rows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getWorkoutByWeek(3, 1);

    expect(result[0].completed).toBe(true);
  });

  it('sets completed: false when completed_at is null', async () => {
    const rows = [
      {
        id: 31,
        completed_at: null,
        cycle_movements: { cycle_id: 3, movements: { name: 'Front Squat' } },
        workout_sets: [{ set_number: 1, scheduled_weight: 80 }],
      },
    ];
    const mockSupabase = makeMockSupabase({ data: rows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getWorkoutByWeek(3, 2);

    expect(result[0].completed).toBe(false);
  });

  it('returns [] when no rows exist', async () => {
    const mockSupabase = makeMockSupabase({ data: [], error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getWorkoutByWeek(99, 1);

    expect(result).toEqual([]);
  });

  it('throws on DB error', async () => {
    const pgError = { message: 'DB failure', code: '42P01' };
    const mockSupabase = makeMockSupabase({ data: null, error: pgError });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await expect(getWorkoutByWeek(1, 1)).rejects.toEqual(pgError);
  });

  it('calls query with the exact cycleId and week passed in', async () => {
    const mockSupabase = makeMockSupabase({ data: [], error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await getWorkoutByWeek(7, 3);

    const { firstEq, secondEq } = mockSupabase._mocks;
    expect(firstEq).toHaveBeenCalledWith('week', 3);
    expect(secondEq).toHaveBeenCalledWith('cycle_movements.cycle_id', 7);
  });
});
