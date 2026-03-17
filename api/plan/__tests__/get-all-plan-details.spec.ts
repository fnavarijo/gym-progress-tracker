import { createClient } from '@/lib/supabase/server';
import { getAllPlanDetails } from '../get-all-plan-details';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

function makeMockSupabase({
  data,
  error,
}: {
  data: object[] | null;
  error: object | null;
}) {
  const order = jest.fn().mockResolvedValue({ data, error });
  const select = jest.fn().mockReturnValue({ order });
  const from = jest.fn().mockReturnValue({ select });

  return { from };
}

const planRows = [
  {
    id: 1,
    name: 'Strength Block A',
    description: 'Focus on strength',
    length_weeks: 5,
    is_system: true,
    plan_movements: [
      {
        id: 10,
        day_of_week: 1,
        movement_id: 3,
        movements: { name: 'Back Squat' },
        plan_routines: [
          { week: 1, set_number: 1, percentage_pr: '0.75', repetitions: 5 },
          { week: 1, set_number: 2, percentage_pr: '0.80', repetitions: 3 },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Hypertrophy Block',
    description: null,
    length_weeks: 4,
    is_system: false,
    plan_movements: [],
  },
];

describe('getAllPlanDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns plans mapped to PlanDetail[]', async () => {
    const mockSupabase = makeMockSupabase({ data: planRows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getAllPlanDetails();

    expect(result).toEqual([
      {
        id: 1,
        name: 'Strength Block A',
        description: 'Focus on strength',
        lengthWeeks: 5,
        isSystem: true,
        planMovements: [
          {
            id: 10,
            movementId: 3,
            movementName: 'Back Squat',
            dayOfWeek: 1,
            routines: [
              { week: 1, setNumber: 1, percentagePr: 0.75, repetitions: 5 },
              { week: 1, setNumber: 2, percentagePr: 0.80, repetitions: 3 },
            ],
          },
        ],
      },
      {
        id: 2,
        name: 'Hypertrophy Block',
        description: null,
        lengthWeeks: 4,
        isSystem: false,
        planMovements: [],
      },
    ]);
  });

  it('parses percentage_pr string to float', async () => {
    const mockSupabase = makeMockSupabase({ data: planRows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getAllPlanDetails();

    expect(result[0].planMovements[0].routines[0].percentagePr).toBe(0.75);
  });

  it('queries plans table with full nested select and orders by created_at', async () => {
    const mockSupabase = makeMockSupabase({ data: planRows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await getAllPlanDetails();

    expect(mockSupabase.from).toHaveBeenCalledWith('plans');
    const order = mockSupabase.from.mock.results[0].value.select.mock.results[0].value.order;
    expect(order).toHaveBeenCalledWith('created_at', { ascending: true });
  });

  it('returns empty array when no plans exist', async () => {
    const mockSupabase = makeMockSupabase({ data: [], error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getAllPlanDetails();

    expect(result).toEqual([]);
  });

  it('throws on DB error', async () => {
    const pgError = { message: 'DB failure', code: '42P01' };
    const mockSupabase = makeMockSupabase({ data: null, error: pgError });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await expect(getAllPlanDetails()).rejects.toEqual(pgError);
  });
});
