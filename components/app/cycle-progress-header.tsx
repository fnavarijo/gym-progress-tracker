'use client';

import { CardContainer } from '@/components/ui/card-container';

interface CycleInfo {
  currentWeek: number;
  totalWeeks: number;
  weeksCompleted: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export function CycleProgressHeader({ cycleInfo }: { cycleInfo: CycleInfo }) {
  const { currentWeek, totalWeeks, weeksCompleted } = cycleInfo;
  const progressPct = (weeksCompleted / totalWeeks) * 100;

  return (
    <div className="sticky top-0 z-10 bg-background px-4 pt-6 pb-4">
      <p className="text-primary text-sm font-medium">{getGreeting()}</p>
      <h1 className="text-4xl font-bold text-foreground mt-1 mb-4">
        Week {currentWeek} of {totalWeeks}
      </h1>
      <CardContainer className="gap-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-sm">Cycle Progress</span>
          <span className="text-muted-foreground text-sm">
            {weeksCompleted} of {totalWeeks} weeks completed
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </CardContainer>
    </div>
  );
}
