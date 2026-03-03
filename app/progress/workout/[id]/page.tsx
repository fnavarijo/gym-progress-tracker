import { notFound } from 'next/navigation';
import { getWorkoutDetail } from '@/api/workout/get-workout-detail';
import { WorkoutDetailView } from '@/components/app/workout-detail';

type Params = Promise<{ id: string }>;

export default async function WorkoutDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const workoutId = Number(id);

  if (!Number.isInteger(workoutId) || workoutId <= 0) {
    notFound();
  }

  const workout = await getWorkoutDetail(workoutId);

  if (!workout) {
    notFound();
  }

  return <WorkoutDetailView workout={workout} />;
}
