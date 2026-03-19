'use client';

import { CycleMovementEntry } from '@/api/workout/get-cycle-movements-for-week';
import { WorkoutItem } from './workout-item';

function getTodayDayOfWeek(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 7 : jsDay;
}

export function WorkoutList({ movements }: { movements: CycleMovementEntry[] }) {
  const todayDayOfWeek = getTodayDayOfWeek();
  return (
    <section>
      <div className="flex flex-col gap-2">
        {movements.map((movement) => (
          <WorkoutItem key={movement.cycleMovementId} movement={movement} todayDayOfWeek={todayDayOfWeek} />
        ))}
      </div>
    </section>
  );
}
