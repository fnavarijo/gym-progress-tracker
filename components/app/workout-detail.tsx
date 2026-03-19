'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { CardContainer } from '@/components/ui/card-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ArrowLeft, Check, Dumbbell, Loader2, Pencil, Trophy } from 'lucide-react';
import type { WorkoutDetail, WorkoutSetDetail } from '@/api/workout/get-workout-detail';
import { updateWorkoutSet } from '@/api/workout/update-workout-set';
import { updateWorkout } from '@/api/workout/update-workout';
import { updateEvaluationWorkoutSet } from '@/api/workout/update-evaluation-workout-set';
import { createEvaluationResult } from '@/api/workout/create-evaluation-result';
import { updateCycleMovementPr } from '@/api/workout/update-cycle-movement-pr';
import { updateWorkoutSetWeight } from '@/api/workout/update-workout-set-weight';
import { useTranslations } from 'next-intl';

interface WorkoutDetailProps {
  workout: WorkoutDetail;
  isEvaluation: boolean;
  cycleMovementId: number;
}

export function WorkoutDetailView({ workout, isEvaluation, cycleMovementId }: WorkoutDetailProps) {
  const router = useRouter();
  const t = useTranslations('Workout');
  const tCommon = useTranslations('Common');

  const [localOneRM, setLocalOneRM] = useState(workout.oneRM);
  const [localSets, setLocalSets] = useState(workout.sets);

  const [completedSets, setCompletedSets] = useState<Set<number>>(
    new Set(workout.sets.filter((s) => s.completedAt !== null).map((s) => s.setNumber)),
  );
  const [setWeights, setSetWeights] = useState<Record<number, string>>({});

  const [usedWeights, setUsedWeights] = useState<Record<number, number | null>>(
    Object.fromEntries(workout.sets.map((s) => [s.id, s.usedWeight])),
  );
  const [logInputSetId, setLogInputSetId] = useState<number | null>(null);
  const [logInputValue, setLogInputValue] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  const [finishing, setFinishing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [prInput, setPrInput] = useState('');

  const isCompleted = workout.completedAt !== null && !isEvaluation;

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
      if (wasCompleted) {
        next.delete(set.setNumber);
      } else {
        next.add(set.setNumber);
      }
      return next;
    });

    const { error } = await updateWorkoutSet(set.id, !wasCompleted);

    if (error) {
      setCompletedSets((prev) => {
        const next = new Set(prev);
        if (wasCompleted) {
          next.add(set.setNumber);
        } else {
          next.delete(set.setNumber);
        }
        return next;
      });
      toast.error(t('couldNotSave'));
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
          toast.error(t('couldNotSaveSets'));
          return;
        }
      }

      const lastSet = workout.sets.reduce((a, b) => (b.setNumber > a.setNumber ? b : a));
      const lastWeight = parseFloat(setWeights[lastSet.setNumber]);
      const { error: evalError } = await createEvaluationResult(cycleMovementId, lastWeight);
      if (evalError) {
        setFinishing(false);
        toast.error(t('couldNotSaveEval'));
        return;
      }
    }

    const { error } = await updateWorkout(workout.id);
    if (error) {
      setFinishing(false);
      toast.error(t('couldNotFinish'));
      return;
    }
    router.push('/');
  };

  const remaining = localSets.length - completedSets.size;

  if (localOneRM === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-primary/8 via-primary/5 to-transparent border-r flex-col justify-center px-12 lg:px-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Momentum</p>
          <h2 className="text-5xl font-bold tracking-tight leading-tight">{workout.name}</h2>
          <p className="text-muted-foreground mt-4 max-w-sm">{t('logAndBuild')}</p>
        </div>
        <div className="w-full md:w-[420px] md:shrink-0 flex flex-col min-h-screen md:h-screen md:overflow-y-auto">
          <div className="bg-gradient-to-b from-primary/8 to-transparent md:bg-none">
            <div className="px-4 md:px-6 pt-6 pb-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {tCommon('back')}
              </button>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                {t('workoutLabel')}
              </p>
              <h1 className="text-3xl font-bold tracking-tight leading-tight break-words">
                {workout.name}
              </h1>
              <div className="mt-4 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/50" />
                  {t('weekOf', { week: workout.week, total: workout.totalWeeks })}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t('liftsDone', { completed: workout.weeklyCompleted, total: workout.weeklyTotal })}
                </span>
              </div>
            </div>
          </div>
          <main className="flex-1 px-4 md:px-6 pt-4 flex flex-col gap-3">
          <CardContainer className="gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('noPrRecorded')}
            </p>
            <p className="text-sm text-muted-foreground">{t('enterOneRm')}</p>
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
              <span className="text-base font-medium text-muted-foreground">{t('lb')}</span>
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
                    toast.error(t('couldNotUpdatePr'));
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
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : tCommon('update')}
              </Button>
            </div>
          </CardContainer>
          <CardContainer className="gap-2 bg-muted/50 border-dashed">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('dontKnowPr')}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Do a quick warm-up round:{' '}
              <span className="font-semibold text-foreground">1×80%</span>,{' '}
              <span className="font-semibold text-foreground">1×90%</span>, and{' '}
              <span className="font-semibold text-foreground">1×100%</span>.
              Register the weight you lifted at your 100% effort.
            </p>
          </CardContainer>
        </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Branding panel — desktop only */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-primary/8 via-primary/5 to-transparent border-r flex-col justify-center px-12 lg:px-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Momentum</p>
        <h2 className="text-5xl font-bold tracking-tight leading-tight">{workout.name}</h2>
        <p className="text-muted-foreground mt-4 max-w-sm">{t('logAndBuild')}</p>
      </div>

      {/* Action panel */}
      <div className="w-full md:w-[420px] md:shrink-0 flex flex-col min-h-screen md:h-screen md:overflow-y-auto">
      <div className="bg-gradient-to-b from-primary/8 to-transparent md:bg-none">
        <div className="px-4 md:px-6 pt-6 pb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {tCommon('back')}
          </button>

          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            {t('workoutLabel')}
          </p>
          <h1 className="text-3xl font-bold tracking-tight leading-tight break-words">
            {workout.name}
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/50" />
              {t('weekOf', { week: workout.week, total: workout.totalWeeks })}
            </span>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                <Check className="w-3.5 h-3.5" />
                {t('completed')}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                {t('liftsDone', { completed: workout.weeklyCompleted, total: workout.weeklyTotal })}
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 md:px-6 pb-24 md:pb-8 flex flex-col gap-3 mt-4">
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
                  <span className="text-xl font-medium text-muted-foreground">{t('lb')}</span>
                </div>
              </div>
              <Dumbbell className="w-5 h-5 text-muted-foreground mt-1" />
            </div>
          </CardContainer>
        )}

        {isEvaluation ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-2 mb-1">
              {t('evaluationSets')}
            </p>

            {localSets.map((s) => (
              <div
                key={s.setNumber}
                className="rounded-xl border bg-card px-4 py-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {t('set', { number: s.setNumber })}
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
                  <span className="text-base font-medium text-muted-foreground shrink-0">{t('lb')}</span>
                </div>
              </div>
            ))}
          </>
        ) : isCompleted ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-2 mb-1">
              {t('sets')}
            </p>

            {localSets.map((s) => (
              <div
                key={s.setNumber}
                className="rounded-xl border border-primary bg-primary/5 overflow-hidden"
              >
                <div className="flex items-center gap-4 px-4 py-4">
                  <div className="w-1 self-stretch rounded-full shrink-0 bg-primary" />
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-primary">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold tabular-nums opacity-50">{s.weight}</span>
                        <span className="text-sm text-muted-foreground">{t('lb')}</span>
                      </div>
                      <span className="text-lg text-muted-foreground/40 font-light">×</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold tabular-nums opacity-50">{s.reps}</span>
                        <span className="text-sm text-muted-foreground">reps</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs text-muted-foreground">{s.percentage}%</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{t('lbPerSide', { value: Math.max(0, (s.weight - 45) / 2) })}</span>
                    </div>
                  </div>
                  {s.usedWeight != null ? (
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                        {t('liftedLabel')}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {s.usedWeight} {t('lb')}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-2 mb-1">
              {t('sets')}
            </p>

            {localSets.map((s) => {
              const isComplete = completedSets.has(s.setNumber);
              const loggedWeight = usedWeights[s.id];
              const isLogOpen = logInputSetId === s.id;

              return (
                <div
                  key={s.setNumber}
                  className={cn(
                    'rounded-xl border bg-card transition-colors overflow-hidden',
                    isComplete ? 'border-primary bg-primary/5' : '',
                  )}
                >
                  {/* Main row — tapping completes the set */}
                  <div
                    className={cn(
                      'flex items-center gap-4 px-4 py-4 cursor-pointer',
                      !isComplete && 'hover:bg-accent',
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
                      <div className="flex items-baseline gap-2.5">
                        <div className="flex items-baseline gap-1">
                          <span className={cn('text-3xl font-bold tabular-nums', isComplete && 'opacity-50')}>{s.weight}</span>
                          <span className="text-sm text-muted-foreground">{t('lb')}</span>
                        </div>
                        <span className="text-lg text-muted-foreground/40 font-light">×</span>
                        <div className="flex items-baseline gap-1">
                          <span className={cn('text-3xl font-bold tabular-nums', isComplete && 'opacity-50')}>{s.reps}</span>
                          <span className="text-sm text-muted-foreground">reps</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-muted-foreground">{s.percentage}%</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{t('lbPerSide', { value: Math.max(0, (s.weight - 45) / 2) })}</span>
                      </div>
                    </div>

                    {!isComplete && (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground shrink-0">
                        {t('tap')}
                      </span>
                    )}

                    {isComplete && loggedWeight != null && !isLogOpen && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLogInputValue(String(loggedWeight));
                          setLogInputSetId(s.id);
                        }}
                        className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary shrink-0"
                      >
                        {loggedWeight} {t('lb')}
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}

                    {isComplete && loggedWeight == null && !isLogOpen && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLogInputValue(String(s.weight));
                          setLogInputSetId(s.id);
                        }}
                        className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground shrink-0"
                      >
                        {t('logWeight')}
                      </button>
                    )}
                  </div>

                  {/* Inline weight log input */}
                  {isLogOpen && (
                    <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border/50 pt-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {t('actualWeight')}
                      </p>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          inputMode="decimal"
                          min="1"
                          value={logInputValue}
                          onChange={(e) => setLogInputValue(e.target.value)}
                          autoFocus
                          className={cn(
                            'w-28 h-10 rounded-lg bg-muted text-right px-3 text-base font-bold tabular-nums',
                            'focus:outline-none focus:ring-2 focus:ring-primary',
                            '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none',
                            '[&::-webkit-outer-spin-button]:appearance-none text-foreground',
                          )}
                        />
                        <span className="text-base font-medium text-muted-foreground">{t('lb')}</span>
                        <div className="flex items-center gap-2 ml-auto">
                          <Button
                            variant="ghost"
                            className="h-8 px-3 text-xs rounded-lg"
                            onClick={() => setLogInputSetId(null)}
                            disabled={savingWeight}
                          >
                            {tCommon('cancel')}
                          </Button>
                          <Button
                            className="h-8 px-3 text-xs rounded-lg"
                            disabled={!logInputValue || Number(logInputValue) <= 0 || savingWeight}
                            onClick={async () => {
                              setSavingWeight(true);
                              const weight = parseFloat(logInputValue);
                              const { error } = await updateWorkoutSetWeight(s.id, weight);
                              if (error) {
                                toast.error(t('couldNotSaveWeight'));
                              } else {
                                setUsedWeights((prev) => ({ ...prev, [s.id]: weight }));
                                setLogInputSetId(null);
                              }
                              setSavingWeight(false);
                            }}
                          >
                            {savingWeight ? <Loader2 className="w-3 h-3 animate-spin" /> : tCommon('save')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </main>

      {!isCompleted && (
        <div className="sticky md:relative bottom-0 px-4 md:px-6 pb-6 pt-10 md:pt-4 flex flex-col gap-2 bg-gradient-to-t from-background via-background/95 to-transparent md:bg-none">
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
            {finishing ? t('finishing') : isEvaluation ? t('savePrAndFinish') : t('finishWorkout')}
          </Button>
          {!allComplete && !isEvaluation && (
            <p className="text-center text-xs text-muted-foreground">
              {remaining !== 1 ? t('setsRemainingPlural', { count: remaining }) : t('setsRemaining', { count: remaining })}
            </p>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
