'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CardContainer } from '@/components/ui/card-container';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, Check, Dumbbell, Loader2 } from 'lucide-react';
import type { WorkoutDetail, WorkoutSetDetail } from '@/api/workout/get-workout-detail';
import { updateWorkoutSet } from '@/api/workout/update-workout-set';
import { updateWorkout } from '@/api/workout/update-workout';

interface WorkoutDetailProps {
  workout: WorkoutDetail;
}

export function WorkoutDetailView({ workout }: WorkoutDetailProps) {
  const router = useRouter();

  const [completedSets, setCompletedSets] = useState<Set<number>>(
    new Set(workout.sets.filter((s) => s.completedAt !== null).map((s) => s.setNumber)),
  );

  const [finishing, setFinishing] = useState(false);

  const allComplete = completedSets.size === workout.sets.length;

  const toggleSet = async (set: WorkoutSetDetail) => {
    const wasCompleted = completedSets.has(set.setNumber);

    setCompletedSets((prev) => {
      const next = new Set(prev);
      wasCompleted ? next.delete(set.setNumber) : next.add(set.setNumber);
      return next;
    });

    const { error } = await updateWorkoutSet(set.id, !wasCompleted);

    if (error) {
      setCompletedSets((prev) => {
        const next = new Set(prev);
        wasCompleted ? next.add(set.setNumber) : next.delete(set.setNumber);
        return next;
      });
      toast.error('Could not save. Please try again.');
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    const { error } = await updateWorkout(workout.id);
    if (error) {
      setFinishing(false);
      toast.error('Could not finish workout. Please try again.');
      return;
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 p-4 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <main className="px-4 pt-2 pb-8 flex flex-col gap-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{workout.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Week {workout.week} of {workout.totalWeeks}
          </p>
          <p className="text-muted-foreground text-sm">
            {workout.weeklyCompleted} of {workout.weeklyTotal} lifts completed this week
          </p>
        </div>

        <CardContainer className="flex-row justify-between items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">1RM (PR)</span>
            <span className="text-primary text-2xl font-bold">{workout.oneRM} lb</span>
          </div>
          <Dumbbell className="w-8 h-8 text-muted-foreground" />
        </CardContainer>

        {workout.sets.map((s) => {
          const isComplete = completedSets.has(s.setNumber);
          return (
            <CardContainer
              key={s.setNumber}
              className={cn('flex-row items-center gap-4 cursor-pointer', isComplete && 'bg-primary/10')}
              status={isComplete ? 'selected' : undefined}
              onClick={() => toggleSet(s)}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  isComplete
                    ? 'bg-primary'
                    : 'border border-muted-foreground text-muted-foreground',
                )}
              >
                {isComplete ? (
                  <Check className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <span className="text-sm font-medium">{s.setNumber}</span>
                )}
              </div>

              <div className="flex-1 flex flex-col">
                <div>
                  <span className="text-3xl font-bold">{s.weight}</span>
                  <span className="text-base"> lb</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {s.percentage}% &bull; x{s.reps}
                </span>
              </div>

              {!isComplete && (
                <span className="text-primary text-sm">Tap to complete</span>
              )}
            </CardContainer>
          );
        })}

        <div>
          <Button
            disabled={!allComplete || finishing}
            className="w-full h-12 text-base"
            onClick={handleFinish}
          >
            {finishing
              ? <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              : <Check className="w-5 h-5 mr-2" />}
            {finishing ? 'Finishing…' : 'Finish Workout'}
          </Button>
          <p className="text-center text-muted-foreground text-sm mt-2">
            Mark all sets as complete to finish
          </p>
        </div>
      </main>
    </div>
  );
}
