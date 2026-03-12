import { notFound } from 'next/navigation';
import { getUserActiveCycle } from '@/api/cycle/get-user-active-cycle';
import { getOrCreateWorkout } from '@/api/workout/get-or-create-workout';
import { getWorkoutDetail } from '@/api/workout/get-workout-detail';
import { WorkoutDetailView } from '@/components/app/workout-detail';

type Params = Promise<{ id: string }>;

export default async function WorkoutDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const cycleMovementId = Number(id);

  if (!Number.isInteger(cycleMovementId) || cycleMovementId <= 0) {
    notFound();
  }

  const cycle = await getUserActiveCycle();
  if (!cycle) notFound();

  const { workoutId, isEvaluation } = await getOrCreateWorkout(
    cycleMovementId,
    cycle.currentWeek,
  );

  const workout = await getWorkoutDetail(workoutId);
  console.log(workout);
  if (!workout) notFound();

  return (
    <WorkoutDetailView
      workout={workout}
      isEvaluation={isEvaluation}
      cycleMovementId={cycleMovementId}
    />
  );
}
