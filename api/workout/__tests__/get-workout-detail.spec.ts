import { createClient } from '@/lib/supabase/server';
import { getWorkoutDetail } from '../get-workout-detail';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

function makeMockSupabase({
  workoutData,
  workoutError,
  weekData,
  weekError,
}: {
  workoutData: unknown;
  workoutError: unknown;
  weekData: unknown;
  weekError: unknown;
}) {
  // First .from() call: detail query → .select().eq(id).maybeSingle()
  const maybeSingle  = jest.fn().mockResolvedValue({ data: workoutData, error: workoutError });
  const detailEq     = jest.fn().mockReturnValue({ maybeSingle });
  const detailSelect = jest.fn().mockReturnValue({ eq: detailEq });

  // Second .from() call: weekly progress → .select().eq(week).eq(cycleId)
  const weekSecondEq = jest.fn().mockResolvedValue({ data: weekData, error: weekError });
  const weekFirstEq  = jest.fn().mockReturnValue({ eq: weekSecondEq });
  const weekSelect   = jest.fn().mockReturnValue({ eq: weekFirstEq });

  const from = jest.fn()
    .mockReturnValueOnce({ select: detailSelect })
    .mockReturnValueOnce({ select: weekSelect });

  return { from, _mocks: { maybeSingle, detailEq, weekFirstEq, weekSecondEq } };
}

/** Workout row with sets intentionally out of order to test sorting */
const workoutRow = {
  id: 5,
  week: 1,
  completed_at: null,
  cycle_movements: {
    cycle_id: 1,
    max_pr: '225.00',
    movements: { name: 'Back Squat' },
    cycles: { plans: { length_weeks: 6 } },
  },
  workout_sets: [
    {
      id: 10,
      set_number: 2,
      scheduled_weight: '170.00',
      completed_at: '2026-01-05T10:00:00Z',
      plan_routines: { percentage_pr: '0.7500', repetitions: 5 },
    },
    {
      id: 11,
      set_number: 1,
      scheduled_weight: '158.00',
      completed_at: null,
      plan_routines: { percentage_pr: '0.7000', repetitions: 5 },
    },
    {
      id: 12,
      set_number: 3,
      scheduled_weight: '180.00',
      completed_at: null,
      plan_routines: { percentage_pr: '0.8000', repetitions: 3 },
    },
  ],
};

const weekWorkouts = [
  { id: 5,  completed_at: null },
  { id: 6,  completed_at: '2026-01-05T09:00:00Z' },
  { id: 7,  completed_at: null },
];

describe('getWorkoutDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a mapped WorkoutDetail for a valid workout id', async () => {
    const mock = makeMockSupabase({
      workoutData: workoutRow, workoutError: null,
      weekData: weekWorkouts,  weekError: null,
    });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await getWorkoutDetail(5);

    expect(result).toEqual({
      id:              5,
      name:            'Back Squat',
      oneRM:           225,
      week:            1,
      totalWeeks:      6,
      weeklyCompleted: 1,
      weeklyTotal:     3,
      sets: [
        { id: 11, setNumber: 1, weight: 158, percentage: 70, reps: 5, completedAt: null },
        { id: 10, setNumber: 2, weight: 170, percentage: 75, reps: 5, completedAt: '2026-01-05T10:00:00Z' },
        { id: 12, setNumber: 3, weight: 180, percentage: 80, reps: 3, completedAt: null },
      ],
    });
  });

  it('sorts sets by set_number ascending', async () => {
    const mock = makeMockSupabase({
      workoutData: workoutRow, workoutError: null,
      weekData: [], weekError: null,
    });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await getWorkoutDetail(5);

    const setNumbers = result!.sets.map((s) => s.setNumber);
    expect(setNumbers).toEqual([1, 2, 3]);
  });

  it('converts percentage_pr to integer percentage (0.7500 → 75)', async () => {
    const mock = makeMockSupabase({
      workoutData: workoutRow, workoutError: null,
      weekData: [], weekError: null,
    });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await getWorkoutDetail(5);

    expect(result!.sets[0].percentage).toBe(70);
    expect(result!.sets[1].percentage).toBe(75);
    expect(result!.sets[2].percentage).toBe(80);
  });

  it('maps completedAt correctly from workout_sets', async () => {
    const mock = makeMockSupabase({
      workoutData: workoutRow, workoutError: null,
      weekData: [], weekError: null,
    });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await getWorkoutDetail(5);

    expect(result!.sets[0].completedAt).toBeNull();
    expect(result!.sets[1].completedAt).toBe('2026-01-05T10:00:00Z');
  });

  it('counts weeklyCompleted from workouts with completed_at set', async () => {
    const mock = makeMockSupabase({
      workoutData: workoutRow, workoutError: null,
      weekData:    weekWorkouts, weekError: null,
    });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await getWorkoutDetail(5);

    expect(result!.weeklyCompleted).toBe(1);
    expect(result!.weeklyTotal).toBe(3);
  });

  it('returns null when workout is not found', async () => {
    const mock = makeMockSupabase({
      workoutData: null, workoutError: null,
      weekData: null,    weekError: null,
    });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await getWorkoutDetail(999);

    expect(result).toBeNull();
  });

  it('throws on DB error in the detail query', async () => {
    const pgError = { message: 'relation not found', code: '42P01' };
    const mock = makeMockSupabase({
      workoutData: null, workoutError: pgError,
      weekData: null,    weekError: null,
    });
    mockCreateClient.mockResolvedValue(mock as never);

    await expect(getWorkoutDetail(5)).rejects.toEqual(pgError);
  });

  it('throws on DB error in the weekly progress query', async () => {
    const pgError = { message: 'permission denied', code: '42501' };
    const mock = makeMockSupabase({
      workoutData: workoutRow, workoutError: null,
      weekData: null,          weekError: pgError,
    });
    mockCreateClient.mockResolvedValue(mock as never);

    await expect(getWorkoutDetail(5)).rejects.toEqual(pgError);
  });

  it('queries with the exact workout id passed in', async () => {
    const mock = makeMockSupabase({
      workoutData: workoutRow, workoutError: null,
      weekData: weekWorkouts,  weekError: null,
    });
    mockCreateClient.mockResolvedValue(mock as never);

    await getWorkoutDetail(42);

    expect(mock._mocks.detailEq).toHaveBeenCalledWith('id', 42);
  });

  it('queries weekly progress with the workout week and cycle_id', async () => {
    const mock = makeMockSupabase({
      workoutData: workoutRow, workoutError: null,
      weekData: weekWorkouts,  weekError: null,
    });
    mockCreateClient.mockResolvedValue(mock as never);

    await getWorkoutDetail(5);

    expect(mock._mocks.weekFirstEq).toHaveBeenCalledWith('week', 1);
    expect(mock._mocks.weekSecondEq).toHaveBeenCalledWith('cycle_movements.cycle_id', 1);
  });
});
