import { WorkoutItem } from './workout-item';

interface Workout {
  id: string;
  name: string;
  topSet: number;
  completed: boolean;
}

export function WorkoutList({ workouts }: { workouts: Workout[] }) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-3">Workouts</h2>
      <div className="flex flex-col gap-3">
        {workouts.map((workout) => (
          <WorkoutItem key={workout.id} workout={workout} />
        ))}
      </div>
    </section>
  );
}
