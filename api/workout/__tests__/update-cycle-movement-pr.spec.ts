import { createClient } from '@/lib/supabase/server';
import { updateCycleMovementPR } from '../update-cycle-movement-pr';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

function makeMockSupabase(result: { data: unknown; error: unknown }) {
  const eq = jest.fn().mockResolvedValue(result);
  const update = jest.fn().mockReturnValue({ eq });
  const from = jest.fn().mockReturnValue({ update });
  return { from, _mocks: { from, update, eq } };
}

describe('updateCycleMovementPR', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates max_pr on cycle_movements for the given id', async () => {
    const mockSupabase = makeMockSupabase({ data: null, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    await updateCycleMovementPR(5, 225);

    expect(mockSupabase._mocks.from).toHaveBeenCalledWith('cycle_movements');
    expect(mockSupabase._mocks.update).toHaveBeenCalledWith({ max_pr: 225 });
    expect(mockSupabase._mocks.eq).toHaveBeenCalledWith('id', 5);
  });

  it('returns { error: null } on success', async () => {
    const mockSupabase = makeMockSupabase({ data: null, error: null });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await updateCycleMovementPR(5, 225);

    expect(result).toEqual({ error: null });
  });

  it('returns { error: message } on DB error', async () => {
    const mockSupabase = makeMockSupabase({ data: null, error: { message: 'DB failure' } });
    mockCreateClient.mockResolvedValue(mockSupabase as never);

    const result = await updateCycleMovementPR(5, 225);

    expect(result).toEqual({ error: 'DB failure' });
  });
});
