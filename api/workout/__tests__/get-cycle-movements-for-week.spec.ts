import { createClient } from '@/lib/supabase/server';
import { getCycleMovementsForWeek } from '../get-cycle-movements-for-week';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

function makeMockSupabase({
  planMovementsResult,
  cycleMovementsResult,
}: {
  planMovementsResult: { data: unknown; error: unknown };
  cycleMovementsResult: { data: unknown; error: unknown };
}) {
  // Query A: from('plan_movements').select(...).eq('plan_id', planId).eq('plan_routines.week', week)
  const planEq2    = jest.fn().mockResolvedValue(planMovementsResult);
  const planEq1    = jest.fn().mockReturnValue({ eq: planEq2 });
  const planSelect = jest.fn().mockReturnValue({ eq: planEq1 });

  // Query B: from('cycle_movements').select(...).eq('cycle_id', cycleId)
  const cycleEq     = jest.fn().mockResolvedValue(cycleMovementsResult);
  const cycleSelect = jest.fn().mockReturnValue({ eq: cycleEq });

  const from = jest.fn().mockImplementation((table: string) => {
    if (table === 'plan_movements') return { select: planSelect };
    if (table === 'cycle_movements') return { select: cycleSelect };
    throw new Error(`Unexpected table: ${table}`);
  });

  return {
    from,
    _mocks: { planEq1, planEq2, cycleEq },
  };
}

const planMovementsData = [
  {
    movement_id: 1,
    day_of_week: 1,
    movements: { name: 'Back Squat' },
    plan_routines: [{ week: 1 }],
  },
  {
    movement_id: 2,
    day_of_week: 3,
    movements: { name: 'Deadlift' },
    plan_routines: [{ week: 1 }],
  },
];

const cycleMovementsData = [
  {
    id: 10,
    movement_id: 1,
    max_pr: '200',
    workouts: [{ completed_at: '2026-01-05T10:00:00Z', week: 1 }],
  },
  {
    id: 11,
    movement_id: 2,
    max_pr: '300',
    workouts: [],
  },
];

describe('getCycleMovementsForWeek', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns merged entries for movements scheduled in the given week', async () => {
    const mockSupabase = makeMockSupabase({
      planMovementsResult: { data: planMovementsData, error: null },
      cycleMovementsResult: { data: cycleMovementsData, error: null },
    });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getCycleMovementsForWeek(1, 5, 1);

    expect(result).toEqual([
      { cycleMovementId: 10, name: 'Back Squat', maxPr: 200, dayOfWeek: 1, completed: true },
      { cycleMovementId: 11, name: 'Deadlift',   maxPr: 300, dayOfWeek: 3, completed: false },
    ]);
  });

  it('maxPr is null when cycle_movements.max_pr is null', async () => {
    const cycleData = [{ id: 10, movement_id: 1, max_pr: null, workouts: [] }];
    const planData  = [
      { movement_id: 1, day_of_week: 2, movements: { name: 'Bench Press' }, plan_routines: [{ week: 1 }] },
    ];
    const mockSupabase = makeMockSupabase({
      planMovementsResult:  { data: planData,  error: null },
      cycleMovementsResult: { data: cycleData, error: null },
    });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getCycleMovementsForWeek(2, 5, 1);

    expect(result[0].maxPr).toBeNull();
  });

  it('completed is true when workouts row for the week has completed_at set', async () => {
    const cycleData = [
      {
        id: 10,
        movement_id: 1,
        max_pr: '150',
        workouts: [{ completed_at: '2026-01-06T09:00:00Z', week: 1 }],
      },
    ];
    const planData = [
      { movement_id: 1, day_of_week: 1, movements: { name: 'Squat' }, plan_routines: [{ week: 1 }] },
    ];
    const mockSupabase = makeMockSupabase({
      planMovementsResult:  { data: planData,  error: null },
      cycleMovementsResult: { data: cycleData, error: null },
    });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getCycleMovementsForWeek(3, 5, 1);

    expect(result[0].completed).toBe(true);
  });

  it('completed is false when no workout row exists for that week', async () => {
    const cycleData = [
      { id: 10, movement_id: 1, max_pr: '150', workouts: [] },
    ];
    const planData = [
      { movement_id: 1, day_of_week: 1, movements: { name: 'Squat' }, plan_routines: [{ week: 1 }] },
    ];
    const mockSupabase = makeMockSupabase({
      planMovementsResult:  { data: planData,  error: null },
      cycleMovementsResult: { data: cycleData, error: null },
    });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getCycleMovementsForWeek(3, 5, 1);

    expect(result[0].completed).toBe(false);
  });

  it('excludes movements not scheduled for the given week (no plan_routines entry)', async () => {
    // Query A (plan_movements) returns empty because no routines for week 2
    const mockSupabase = makeMockSupabase({
      planMovementsResult:  { data: [], error: null },
      cycleMovementsResult: { data: cycleMovementsData, error: null },
    });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getCycleMovementsForWeek(1, 5, 2);

    expect(result).toEqual([]);
  });

  it('throws on DB error from query A', async () => {
    const pgError = { message: 'plan_movements error', code: '42P01' };
    const mockSupabase = makeMockSupabase({
      planMovementsResult:  { data: null, error: pgError },
      cycleMovementsResult: { data: cycleMovementsData, error: null },
    });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await expect(getCycleMovementsForWeek(1, 5, 1)).rejects.toEqual(pgError);
  });

  it('throws on DB error from query B', async () => {
    const pgError = { message: 'cycle_movements error', code: '42P01' };
    const mockSupabase = makeMockSupabase({
      planMovementsResult:  { data: planMovementsData, error: null },
      cycleMovementsResult: { data: null, error: pgError },
    });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await expect(getCycleMovementsForWeek(1, 5, 1)).rejects.toEqual(pgError);
  });
});
