import { createClient } from '@/lib/supabase/server';
import { updateCycleMovementPr } from '../update-cycle-movement-pr';

jest.mock('@/lib/supabase/server');

const mockCreateClient = jest.mocked(createClient);

const RAW_ROWS = [
  { out_set_number: 1, out_scheduled_weight: '135.00', out_completed_at: null },
  { out_set_number: 2, out_scheduled_weight: '152.50', out_completed_at: null },
];

describe('updateCycleMovementPr', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls rpc with correct arguments', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: RAW_ROWS, error: null });
    mockCreateClient.mockResolvedValue({ rpc } as never);

    await updateCycleMovementPr(10, 5, 225);

    expect(rpc).toHaveBeenCalledWith('update_cycle_movement_pr', {
      p_workout_id: 10,
      p_cycle_movement_id: 5,
      p_pr: 225,
    });
  });

  it('returns mapped UpdatedSet[] on success', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: RAW_ROWS, error: null });
    mockCreateClient.mockResolvedValue({ rpc } as never);

    const result = await updateCycleMovementPr(10, 5, 225);

    expect(result).toEqual({
      data: [
        { setNumber: 1, scheduledWeight: 135 },
        { setNumber: 2, scheduledWeight: 152.5 },
      ],
      error: null,
    });
  });

  it('returns { data: null, error: message } on DB/RPC error', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { message: 'RPC failure' } });
    mockCreateClient.mockResolvedValue({ rpc } as never);

    const result = await updateCycleMovementPr(10, 5, 225);

    expect(result).toEqual({ data: null, error: 'RPC failure' });
  });
});
