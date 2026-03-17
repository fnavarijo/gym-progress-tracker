import { createClient } from '@/lib/supabase/server';
import { getAllPlans } from '../get-all-plans';

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
  { id: 1, name: 'Strength Block A', description: 'Focus on strength', length_weeks: 5, is_system: true, plan_movements: [{ count: 3 }] },
  { id: 2, name: 'Hypertrophy Block', description: null, length_weeks: 4, is_system: false, plan_movements: [{ count: 5 }] },
];

describe('getAllPlans', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns plans mapped to PlanSummary[]', async () => {
    const mockSupabase = makeMockSupabase({ data: planRows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getAllPlans();

    expect(result).toEqual([
      { id: 1, name: 'Strength Block A', description: 'Focus on strength', lengthWeeks: 5, isSystem: true, movementCount: 3 },
      { id: 2, name: 'Hypertrophy Block', description: null, lengthWeeks: 4, isSystem: false, movementCount: 5 },
    ]);
  });

  it('queries the plans table with correct select and order', async () => {
    const mockSupabase = makeMockSupabase({ data: planRows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await getAllPlans();

    expect(mockSupabase.from).toHaveBeenCalledWith('plans');
    const select = mockSupabase.from.mock.results[0].value.select;
    expect(select).toHaveBeenCalledWith('id, name, description, length_weeks, is_system, plan_movements(count)');
    const order = select.mock.results[0].value.order;
    expect(order).toHaveBeenCalledWith('created_at', { ascending: true });
  });

  it('returns empty array when no plans exist', async () => {
    const mockSupabase = makeMockSupabase({ data: [], error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getAllPlans();

    expect(result).toEqual([]);
  });

  it('handles missing plan_movements gracefully', async () => {
    const rowsWithEmpty = [
      { id: 1, name: 'Plan A', description: null, length_weeks: 5, is_system: false, plan_movements: [] },
    ];
    const mockSupabase = makeMockSupabase({ data: rowsWithEmpty, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getAllPlans();

    expect(result[0].movementCount).toBe(0);
  });

  it('throws on DB error', async () => {
    const pgError = { message: 'DB failure', code: '42P01' };
    const mockSupabase = makeMockSupabase({ data: null, error: pgError });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await expect(getAllPlans()).rejects.toEqual(pgError);
  });
});
