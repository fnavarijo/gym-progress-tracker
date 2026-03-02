'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CardContainer } from '@/components/ui/card-container';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, Check, Dumbbell } from 'lucide-react';

interface WorkoutSet {
  setNumber: number;
  weight: number;
  percentage: number;
  reps: number;
}

interface WorkoutDetail {
  name: string;
  oneRM: number;
  week: number;
  totalWeeks: number;
  weeklyCompleted: number;
  weeklyTotal: number;
  sets: WorkoutSet[];
}

const workout: WorkoutDetail = {
  name: 'Strict Press',
  oneRM: 56,
  week: 1,
  totalWeeks: 6,
  weeklyCompleted: 2,
  weeklyTotal: 5,
  sets: [
    { setNumber: 1, weight: 40, percentage: 70, reps: 5 },
    { setNumber: 2, weight: 42.5, percentage: 75, reps: 5 },
    { setNumber: 3, weight: 45, percentage: 80, reps: 5 },
  ],
};

export default function WorkoutDetailPage() {
  const router = useRouter();
  const [completedSets, setCompletedSets] = useState<Set<number>>(new Set());
  const allComplete = completedSets.size === workout.sets.length;

  const toggleSet = (setNumber: number) => {
    setCompletedSets(prev => {
      const next = new Set(prev);
      if (next.has(setNumber)) {
        next.delete(setNumber);
      } else {
        next.add(setNumber);
      }
      return next;
    });
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

        {workout.sets.map(s => {
          const isComplete = completedSets.has(s.setNumber);
          return (
            <CardContainer
              key={s.setNumber}
              className={cn('flex-row items-center gap-4 cursor-pointer', isComplete && 'bg-primary/10')}
              status={isComplete ? 'selected' : undefined}
              onClick={() => toggleSet(s.setNumber)}
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
            disabled={!allComplete}
            className="w-full h-12 text-base"
            onClick={() => router.push('/')}
          >
            <Check className="w-5 h-5 mr-2" />
            Finish Workout
          </Button>
          <p className="text-center text-muted-foreground text-sm mt-2">
            Mark all sets as complete to finish
          </p>
        </div>
      </main>
    </div>
  );
}
