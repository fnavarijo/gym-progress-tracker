'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CardContainer } from '@/components/ui/card-container';
import { cn } from '@/lib/utils';
import { ExercisePreviewCard } from '@/components/app/exercise-preview-card';

const EXERCISES = [
  'Back Squat',
  'Deadlift',
  'Bench Press',
  'Strict Press',
  'Front Squat',
] as const;

type ExerciseName = (typeof EXERCISES)[number];

type PRRecord = Record<ExerciseName, number>;

export function CycleStartForm() {
  const router = useRouter();

  const [prs, setPrs] = useState<PRRecord>({
    'Back Squat': 0,
    Deadlift: 0,
    'Bench Press': 0,
    'Strict Press': 0,
    'Front Squat': 0,
  });

  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );

  const [focusedExercise, setFocusedExercise] = useState<ExerciseName | null>(
    null,
  );

  const allPRsEntered = Object.values(prs).every((v) => v > 0);

  const formattedDate = new Date(startDate + 'T00:00:00').toLocaleDateString(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    },
  );

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col pb-24">
      {/* Nav */}
      <nav className="px-4 pt-6 pb-2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 px-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ChevronLeft className="size-4" />
          <span className="text-sm">Back</span>
        </Button>
      </nav>

      <div className="px-4 flex flex-col gap-8 flex-1">
        {/* Title */}
        <h1 className="text-3xl font-bold">Create New Cycle</h1>

        {/* Start Date section */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Start Date</h2>
          <label className="cursor-pointer block">
            <CardContainer className="gap-0 flex-row items-center gap-3">
              <CalendarDays className="size-5 text-primary shrink-0" />
              <span className="text-base font-medium">{formattedDate}</span>
            </CardContainer>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="sr-only"
            />
          </label>
        </section>

        {/* Enter Your PRs section */}
        <section>
          <h2 className="text-lg font-semibold">Enter Your PRs</h2>
          <p className="text-muted-foreground text-sm mb-3">Unit: lb</p>
          <div className="flex flex-col gap-3">
            {EXERCISES.map((exercise) => (
              <CardContainer
                key={exercise}
                className={cn(
                  'flex-row items-center justify-between gap-4 py-3',
                  focusedExercise === exercise && 'border-primary',
                )}
              >
                <span className="text-sm font-medium">{exercise}</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={prs[exercise] === 0 ? '' : prs[exercise]}
                  placeholder="0"
                  onChange={(e) =>
                    setPrs((prev) => ({
                      ...prev,
                      [exercise]: Number(e.target.value) || 0,
                    }))
                  }
                  onFocus={() => setFocusedExercise(exercise)}
                  onBlur={() => setFocusedExercise(null)}
                  className={cn(
                    'w-20 h-10 rounded-lg bg-secondary text-right px-3 text-base',
                    'focus:outline-none focus:ring-2 focus:ring-primary',
                    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none',
                    '[&::-webkit-outer-spin-button]:appearance-none',
                    'text-foreground',
                  )}
                />
              </CardContainer>
            ))}
          </div>
        </section>

        {/* Week 1 Preview section */}
        <section>
          <h2 className="text-lg font-semibold">Week 1 Preview</h2>
          <p className="text-muted-foreground text-sm mb-3">
            Calculated working sets for your first week
          </p>
          <div className="flex flex-col gap-3">
            {EXERCISES.map((exercise) => (
              <ExercisePreviewCard
                key={exercise}
                name={exercise}
                pr={prs[exercise]}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Sticky bottom button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-6 pt-3 bg-background">
        <Button
          className="w-full h-14 text-base rounded-2xl"
          disabled={!allPRsEntered}
          onClick={() => router.push('/cycle/summary')}
        >
          Start Cycle
        </Button>
      </div>
    </div>
  );
}
