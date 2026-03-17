import { createClient } from '@/lib/supabase/server';
import { getAllMovements } from '../get-all-movements';

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

const movementRows = [
  { id: 1, name: 'Back Squat' },
  { id: 2, name: 'Bench Press' },
  { id: 3, name: 'Deadlift' },
];

describe('getAllMovements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns movements mapped to Movement[]', async () => {
    const mockSupabase = makeMockSupabase({ data: movementRows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getAllMovements();

    expect(result).toEqual([
      { id: 1, name: 'Back Squat' },
      { id: 2, name: 'Bench Press' },
      { id: 3, name: 'Deadlift' },
    ]);
  });

  it('queries movements table ordered by name', async () => {
    const mockSupabase = makeMockSupabase({ data: movementRows, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await getAllMovements();

    expect(mockSupabase.from).toHaveBeenCalledWith('movements');
    const select = mockSupabase.from.mock.results[0].value.select;
    expect(select).toHaveBeenCalledWith('id, name');
    const order = select.mock.results[0].value.order;
    expect(order).toHaveBeenCalledWith('name');
  });

  it('returns empty array when no movements exist', async () => {
    const mockSupabase = makeMockSupabase({ data: [], error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await getAllMovements();

    expect(result).toEqual([]);
  });

  it('throws on DB error', async () => {
    const pgError = { message: 'DB failure', code: '42P01' };
    const mockSupabase = makeMockSupabase({ data: null, error: pgError });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await expect(getAllMovements()).rejects.toEqual(pgError);
  });
});
