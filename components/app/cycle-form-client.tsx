'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays } from 'lucide-react';

import { createCycle } from '@/api/cycle/create-cycle';
import { PlanMovement } from '@/api/plan/get-plan-movements';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CardContainer } from '@/components/ui/card-container';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface CycleFormClientProps {
  movements: PlanMovement[];
  initialPrs?: Record<string, number>;
  hasPastCycle?: boolean;
}

export function CycleFormClient({
  movements,
  initialPrs,
  hasPastCycle,
}: CycleFormClientProps) {
  const router = useRouter();

  const [prs, setPrs] = useState<Record<string, number>>(
    Object.fromEntries(
      movements.map((m) => [m.name, initialPrs?.[m.name] ?? 0]),
    ),
  );

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [focusedMovement, setFocusedMovement] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formattedDate = startDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      {/* Start Date section */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Start Date
        </h2>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button type="button" className="w-full text-left">
              <CardContainer className="flex-row items-center gap-3">
                <CalendarDays className="size-5 text-primary shrink-0" />
                <span className="text-base font-medium">{formattedDate}</span>
              </CardContainer>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => {
                if (date) {
                  setStartDate(date);
                  setCalendarOpen(false);
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </section>

      {/* Enter Your PRs section */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Enter Your PRs
        </h2>
        <p className="text-xs text-primary bg-primary/10 rounded-lg px-3 py-2 mb-3">
          {hasPastCycle
            ? 'Pre-populated from your last cycle — update any values if your PRs have changed.'
            : "Enter your 1-rep max for each lift. These will be used to calculate your training weights. If you don't any, leave it empty."}
        </p>
        <div className="flex flex-col gap-3">
          {movements.map((movement) => (
            <CardContainer
              key={movement.id}
              className={cn(
                'flex-row items-center justify-between gap-4 py-3',
                focusedMovement === movement.name && 'border-primary',
              )}
            >
              <span className="font-semibold">{movement.name}</span>
              <div
                className={cn(
                  'flex items-center gap-1.5 rounded-lg bg-muted px-3 h-10',
                  focusedMovement === movement.name && 'ring-2 ring-primary',
                )}
              >
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={prs[movement.name] === 0 ? '' : prs[movement.name]}
                  placeholder="0"
                  onChange={(e) =>
                    setPrs((prev) => ({
                      ...prev,
                      [movement.name]: Number(e.target.value) || 0,
                    }))
                  }
                  onFocus={() => setFocusedMovement(movement.name)}
                  onBlur={() => setFocusedMovement(null)}
                  className={cn(
                    'w-14 bg-transparent text-right text-base focus:outline-none',
                    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none',
                    '[&::-webkit-outer-spin-button]:appearance-none',
                    'text-foreground',
                  )}
                />
                <span className="text-xs font-semibold text-muted-foreground">
                  lb
                </span>
              </div>
            </CardContainer>
          ))}
        </div>
      </section>

      {/* Sticky bottom button */}
      <div className="sticky md:relative bottom-0 -mx-4 md:-mx-6 px-4 md:px-6 pb-6 pt-10 md:pt-4 flex flex-col gap-2 bg-gradient-to-t from-background via-background/95 to-transparent md:bg-none">
        {submitError && (
          <p className="text-destructive text-sm mb-2 text-center">
            {submitError}
          </p>
        )}
        <Button
          className="w-full h-14 text-base rounded-xl font-semibold"
          disabled={submitting}
          onClick={async () => {
            setSubmitting(true);
            setSubmitError(null);

            const date = startDate.toLocaleDateString('sv-SE');
            const prsByMovementId = Object.fromEntries(
              movements
                .filter((m) => prs[m.name] > 0)
                .map((m) => [m.id, prs[m.name]]),
            ) as Record<number, number>;

            const { error } = await createCycle({ date, prs: prsByMovementId });

            if (error) {
              setSubmitError(error);
              setSubmitting(false);
              return;
            }

            router.push('/');
          }}
        >
          {submitting ? 'Creating…' : 'Start Cycle'}
        </Button>
      </div>
    </>
  );
}
