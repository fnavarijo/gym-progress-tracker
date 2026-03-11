import { CycleMovementEntry } from '@/api/workout/get-cycle-movements-for-week';
import { WorkoutItem } from './workout-item';

export function WorkoutList({ movements, todayDayOfWeek }: { movements: CycleMovementEntry[]; todayDayOfWeek: number }) {
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
