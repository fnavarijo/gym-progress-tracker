import { createClient } from '@/lib/supabase/server';
import { createEvaluationResult } from '../create-evaluation-result';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

function makeMockSupabase({ error }: { error: unknown }) {
  const insert = jest.fn().mockResolvedValue({ data: null, error });
  const from   = jest.fn().mockReturnValue({ insert });

  return { from, _mocks: { insert } };
}

describe('createEvaluationResult', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns { error: null } on success', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await createEvaluationResult(10, 225);

    expect(result).toEqual({ error: null });
  });

  it('returns { error: message } when Supabase returns an error — does not throw', async () => {
    const mock = makeMockSupabase({ error: { message: 'foreign key violation', code: '23503' } });
    mockCreateClient.mockResolvedValue(mock as never);

    const result = await createEvaluationResult(10, 225);

    expect(result).toEqual({ error: 'foreign key violation' });
  });

  it('calls .from("evaluation_results")', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    await createEvaluationResult(10, 225);

    expect(mock.from).toHaveBeenCalledWith('evaluation_results');
  });

  it('calls .insert({ cycle_movement_id, used_weight }) with correct values', async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock as never);

    await createEvaluationResult(7, 315);

    expect(mock._mocks.insert).toHaveBeenCalledWith({ cycle_movement_id: 7, used_weight: 315 });
  });
});
