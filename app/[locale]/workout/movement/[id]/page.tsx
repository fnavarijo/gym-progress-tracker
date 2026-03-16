import { notFound } from 'next/navigation';
import { getUserActiveCycle } from '@/api/cycle/get-user-active-cycle';
import { getOrCreateWorkout } from '@/api/workout/get-or-create-workout';
import { getWorkoutDetail } from '@/api/workout/get-workout-detail';
import { WorkoutDetailView } from '@/components/app/workout-detail';
import { setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';

type Params = Promise<{ locale: string; id: string }>;

export default async function WorkoutDetailPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

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
  if (!workout) notFound();

  return (
    <WorkoutDetailView
      workout={workout}
      isEvaluation={isEvaluation}
      cycleMovementId={cycleMovementId}
    />
  );
}
