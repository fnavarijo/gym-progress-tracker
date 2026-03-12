import { getLastCycleEvalResults } from '@/api/cycle/get-last-cycle-eval-results';
import { hasUserPastCycles } from '@/api/cycle/has-user-past-cycles';
import { getPlanMovements } from '@/api/plan/get-plan-movements';
import { CycleFormClient } from './cycle-form-client';

export async function PRSection() {
  const [movements, evalResults, hasPastCycle] = await Promise.all([
    getPlanMovements(1),
    getLastCycleEvalResults(),
    hasUserPastCycles(),
  ]);

  const movementIdToName = new Map(movements.map((m) => [m.id, m.name]));
  const initialPrs: Record<string, number> = {};
  for (const r of evalResults) {
    const name = movementIdToName.get(r.movementId);
    if (name) initialPrs[name] = r.usedWeight;
  }

  return <CycleFormClient movements={movements} initialPrs={initialPrs} hasPastCycle={hasPastCycle} />;
}
