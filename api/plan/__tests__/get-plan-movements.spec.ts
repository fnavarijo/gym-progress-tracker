import { createClient } from '@/lib/supabase/server';
import { getPlanMovements } from '../get-plan-movements';

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
  const eq = jest.fn().mockReturnValue({ order });
  const select = jest.fn().mockReturnValue({ eq });
  const from = jest.fn().mockReturnValue({ select });

  return { from };
}

const movementRows = [
  { movements: { id: 1, name: 'Back Squat' } },
  { movements: { id: 2, name: 'Deadlift' } },
  { movements: { id: 3, name: 'Bench Press' } },
];

describe('getPlanMovements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns movements mapped to PlanMovement[]', async () => {
    const mockSupabase = makeMockSupabase({ data: movementRows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getPlanMovements(1);

    expect(result).toEqual([
      { id: 1, name: 'Back Squat' },
      { id: 2, name: 'Deadlift' },
      { id: 3, name: 'Bench Press' },
    ]);
  });

  it('queries with the provided planId', async () => {
    const mockSupabase = makeMockSupabase({ data: movementRows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await getPlanMovements(42);

    expect(mockSupabase.from).toHaveBeenCalledWith('plan_movements');
    const eq = mockSupabase.from.mock.results[0].value.select.mock.results[0].value.eq;
    expect(eq).toHaveBeenCalledWith('plan_id', 42);
  });

  it('returns empty array when no rows are returned', async () => {
    const mockSupabase = makeMockSupabase({ data: [], error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getPlanMovements(1);

    expect(result).toEqual([]);
  });

  it('filters out rows with null movements', async () => {
    const rowsWithNull = [
      { movements: { id: 1, name: 'Back Squat' } },
      { movements: null },
      { movements: { id: 3, name: 'Bench Press' } },
    ];
    const mockSupabase = makeMockSupabase({ data: rowsWithNull, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getPlanMovements(1);

    expect(result).toEqual([
      { id: 1, name: 'Back Squat' },
      { id: 3, name: 'Bench Press' },
    ]);
  });

  it('throws on DB error', async () => {
    const pgError = { message: 'DB failure', code: '42P01' };
    const mockSupabase = makeMockSupabase({ data: null, error: pgError });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await expect(getPlanMovements(1)).rejects.toEqual(pgError);
  });
});
