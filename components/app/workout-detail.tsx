'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CardContainer } from '@/components/ui/card-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ArrowLeft, Check, Dumbbell, Loader2, Trophy } from 'lucide-react';
import type { WorkoutDetail, WorkoutSetDetail } from '@/api/workout/get-workout-detail';
import { updateWorkoutSet } from '@/api/workout/update-workout-set';
import { updateWorkout } from '@/api/workout/update-workout';
import { updateEvaluationWorkoutSet } from '@/api/workout/update-evaluation-workout-set';
import { createEvaluationResult } from '@/api/workout/create-evaluation-result';
import { updateCycleMovementPr } from '@/api/workout/update-cycle-movement-pr';

interface WorkoutDetailProps {
  workout: WorkoutDetail;
  isEvaluation: boolean;
  cycleMovementId: number;
}

export function WorkoutDetailView({ workout, isEvaluation, cycleMovementId }: WorkoutDetailProps) {
  const router = useRouter();

  const [localOneRM, setLocalOneRM] = useState(workout.oneRM);
  const [localSets, setLocalSets] = useState(workout.sets);

  const [completedSets, setCompletedSets] = useState<Set<number>>(
    new Set(workout.sets.filter((s) => s.completedAt !== null).map((s) => s.setNumber)),
  );
  const [setWeights, setSetWeights] = useState<Record<number, string>>({});

  const [finishing, setFinishing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [prInput, setPrInput] = useState('');

  const allComplete = isEvaluation
    ? localSets.every((s) => {
        const v = setWeights[s.setNumber];
        return v !== undefined && v.trim() !== '' && Number(v) > 0;
      })
    : completedSets.size === localSets.length;

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

    if (isEvaluation) {
      for (const s of workout.sets) {
        const weight = parseFloat(setWeights[s.setNumber]);
        const { error } = await updateEvaluationWorkoutSet(s.id, weight);
        if (error) {
          setFinishing(false);
          toast.error('Could not save sets. Please try again.');
          return;
        }
      }

      const lastSet = workout.sets.reduce((a, b) => (b.setNumber > a.setNumber ? b : a));
      const lastWeight = parseFloat(setWeights[lastSet.setNumber]);
      const { error: evalError } = await createEvaluationResult(cycleMovementId, lastWeight);
      if (evalError) {
        setFinishing(false);
        toast.error('Could not save evaluation result. Please try again.');
        return;
      }
    }

    const { error } = await updateWorkout(workout.id);
    if (error) {
      setFinishing(false);
      toast.error('Could not finish workout. Please try again.');
      return;
    }
    router.push('/');
  };

  const remaining = localSets.length - completedSets.size;

  if (localOneRM === null) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col">
        <div className="bg-gradient-to-b from-primary/8 to-transparent">
          <div className="px-4 pt-6 pb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Workout
            </p>
            <h1 className="text-4xl font-bold tracking-tight leading-none">
              {workout.name}
            </h1>
            <div className="mt-4 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/50" />
                Week {workout.week} of {workout.totalWeeks}
              </span>
              <span className="text-sm text-muted-foreground">
                {workout.weeklyCompleted} of {workout.weeklyTotal} lifts done
              </span>
            </div>
          </div>
        </div>
        <main className="flex-1 px-4 pt-4">
          <CardContainer className="gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              No PR Recorded
            </p>
            <p className="text-sm text-muted-foreground">Enter your 1RM to continue</p>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="number"
                inputMode="numeric"
                min="1"
                placeholder="0"
                value={prInput}
                onChange={(e) => setPrInput(e.target.value)}
                className={cn(
                  'w-24 h-10 rounded-lg bg-muted text-right px-3 text-base',
                  'focus:outline-none focus:ring-2 focus:ring-primary',
                  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none',
                  '[&::-webkit-outer-spin-button]:appearance-none text-foreground',
                )}
              />
              <span className="text-base font-medium text-muted-foreground">lb</span>
              <Button
                disabled={!prInput || Number(prInput) <= 0 || updating}
                onClick={async () => {
                  setUpdating(true);
                  const { data, error } = await updateCycleMovementPr(
                    workout.id,
                    cycleMovementId,
                    Number(prInput),
                  );
                  if (error) {
                    toast.error('Could not update PR. Please try again.');
                    setUpdating(false);
                    return;
                  }
                  const weightMap = new Map(data!.map((s) => [s.setNumber, s.scheduledWeight]));
                  setLocalSets((prev) =>
                    prev.map((s) =>
                      weightMap.has(s.setNumber) ? { ...s, weight: weightMap.get(s.setNumber)! } : s,
                    ),
                  );
                  setLocalOneRM(Number(prInput));
                  setUpdating(false);
                }}
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
              </Button>
            </div>
          </CardContainer>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col">
      <div className="bg-gradient-to-b from-primary/8 to-transparent">
        <div className="px-4 pt-6 pb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Workout
          </p>
          <h1 className="text-4xl font-bold tracking-tight leading-none">
            {workout.name}
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/50" />
              Week {workout.week} of {workout.totalWeeks}
            </span>
            <span className="text-sm text-muted-foreground">
              {workout.weeklyCompleted} of {workout.weeklyTotal} lifts done
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 pb-40 flex flex-col gap-3 mt-4">
        {!isEvaluation && localOneRM !== null && (
          <CardContainer className="gap-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  1RM / PR
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-bold tabular-nums leading-none text-foreground">
                    {localOneRM}
                  </span>
                  <span className="text-xl font-medium text-muted-foreground">lb</span>
                </div>
              </div>
              <Dumbbell className="w-5 h-5 text-muted-foreground mt-1" />
            </div>
          </CardContainer>
        )}

        {isEvaluation ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-2 mb-1">
              Evaluation Sets
            </p>

            {localSets.map((s) => (
              <div
                key={s.setNumber}
                className="rounded-xl border bg-card px-4 py-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Set {s.setNumber}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {s.percentage}% · ×{s.reps} reps
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    placeholder="0"
                    value={setWeights[s.setNumber] ?? ''}
                    onChange={(e) =>
                      setSetWeights((prev) => ({ ...prev, [s.setNumber]: e.target.value }))
                    }
                    className="text-2xl font-bold tabular-nums h-12 rounded-xl text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span className="text-base font-medium text-muted-foreground shrink-0">lb</span>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-2 mb-1">
              Sets
            </p>

            {localSets.map((s) => {
              const isComplete = completedSets.has(s.setNumber);
              return (
                <div
                  key={s.setNumber}
                  className={cn(
                    'flex items-center gap-4 rounded-xl border bg-card px-4 py-4 cursor-pointer transition-colors',
                    isComplete ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                  )}
                  onClick={() => toggleSet(s)}
                >
                  <div
                    className={cn(
                      'w-1 self-stretch rounded-full shrink-0',
                      isComplete ? 'bg-primary' : 'bg-muted-foreground/30',
                    )}
                  />
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors',
                      isComplete
                        ? 'bg-primary'
                        : 'border border-muted-foreground/40',
                    )}
                  >
                    {isComplete ? (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">{s.setNumber}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold tabular-nums">{s.weight}</span>
                      <span className="text-base text-muted-foreground">lb</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-muted-foreground">{s.percentage}%</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs font-semibold text-foreground">x{s.reps} reps</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.max(0, (s.weight - 45) / 2)} lb/side
                      </span>
                    </div>
                  </div>

                  {!isComplete && (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground shrink-0">
                      Tap
                    </span>
                  )}
                </div>
              );
            })}
          </>
        )}
      </main>

      <div className="sticky bottom-0 px-4 pb-6 pt-10 flex flex-col gap-2 bg-gradient-to-t from-background via-background/95 to-transparent">
        <Button
          disabled={!allComplete || finishing}
          className="w-full rounded-xl h-14 text-base font-semibold"
          onClick={handleFinish}
        >
          {finishing ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : isEvaluation ? (
            <Trophy className="w-5 h-5 mr-2" />
          ) : (
            <Check className="w-5 h-5 mr-2" />
          )}
          {finishing ? 'Finishing…' : isEvaluation ? 'Save PR & Finish' : 'Finish Workout'}
        </Button>
        {!allComplete && !isEvaluation && (
          <p className="text-center text-xs text-muted-foreground">
            {remaining} set{remaining !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>
    </div>
  );
}
