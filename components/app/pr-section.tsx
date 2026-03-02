import { getPlanMovements } from '@/api/plan/get-plan-movements';
import { CycleFormClient } from './cycle-form-client';

export async function PRSection() {
  const movements = await getPlanMovements(1);
  return <CycleFormClient movements={movements} />;
}
