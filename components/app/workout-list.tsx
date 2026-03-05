import { WorkoutItem } from './workout-item';

interface Workout {
  id: number;
  name: string;
  topSet: number;
  completed: boolean;
}

export function WorkoutList({ workouts }: { workouts: Workout[] }) {
  return (
    <section>
      <div className="flex flex-col gap-2">
        {workouts.map((workout) => (
          <WorkoutItem key={workout.id} workout={workout} />
        ))}
      </div>
    </section>
  );
}
