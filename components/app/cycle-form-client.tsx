'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays } from 'lucide-react';

import { PlanMovement } from '@/api/plan/get-plan-movements';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CardContainer } from '@/components/ui/card-container';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { WeekPreview } from './week-preview';

interface CycleFormClientProps {
  movements: PlanMovement[];
}

export function CycleFormClient({ movements }: CycleFormClientProps) {
  const router = useRouter();

  const [prs, setPrs] = useState<Record<string, number>>(
    Object.fromEntries(movements.map((m) => [m.name, 0])),
  );

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [focusedMovement, setFocusedMovement] = useState<string | null>(null);

  const allPRsEntered = Object.values(prs).every((v) => v > 0);

  const formattedDate = startDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      {/* Start Date section */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Start Date</h2>
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
        <h2 className="text-lg font-semibold">Enter Your PRs</h2>
        <p className="text-muted-foreground text-sm mb-3">Unit: lb</p>
        <div className="flex flex-col gap-3">
          {movements.map((movement) => (
            <CardContainer
              key={movement.id}
              className={cn(
                'flex-row items-center justify-between gap-4 py-3',
                focusedMovement === movement.name && 'border-primary',
              )}
            >
              <span className="text-sm font-medium">{movement.name}</span>
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

      {/* Week 1 Preview — conditionally mounted */}
      {allPRsEntered && <WeekPreview movements={movements} prs={prs} />}

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
    </>
  );
}
