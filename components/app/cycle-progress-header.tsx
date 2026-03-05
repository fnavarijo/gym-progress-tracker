'use client';

interface CycleInfo {
  currentWeek: number;
  totalWeeks: number;
  weeksCompleted: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning!';
  if (hour < 18) return 'Good Afternoon!';
  return 'Good Evening!';
}

export function CycleProgressHeader({ cycleInfo }: { cycleInfo: CycleInfo }) {
  const { currentWeek, totalWeeks } = cycleInfo;
  const progressPct = Math.round(((currentWeek - 1) / totalWeeks) * 100);

  return (
    <div className="px-4 pt-8 pb-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        Active Cycle
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-foreground leading-none">
        {getGreeting()}
      </h1>
      <div className="mt-4 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/50" />
          Week {currentWeek} of {totalWeeks}
        </span>
        <span className="text-sm text-muted-foreground">{progressPct}% through cycle</span>
      </div>
    </div>
  );
}
