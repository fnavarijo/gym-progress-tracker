import { WorkoutItem } from './workout-item';

interface Workout {
  id: number;
  name: string;
  topSet: number;
  completed: boolean;
  dayOfWeek: number;
}

export function WorkoutList({ workouts, todayDayOfWeek }: { workouts: Workout[]; todayDayOfWeek: number }) {
  return (
    <section>
      <div className="flex flex-col gap-2">
        {workouts.map((workout) => (
          <WorkoutItem key={workout.id} workout={workout} todayDayOfWeek={todayDayOfWeek} />
        ))}
      </div>
    </section>
  );
}
