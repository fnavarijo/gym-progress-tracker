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

  return (
    <div className="px-4 pt-6 pb-2">
      <h1 className="text-4xl font-bold text-foreground">{getGreeting()}</h1>
      <div className="mt-2">
        <span className="inline-flex items-center rounded-full border border-primary px-3 py-1 text-sm font-medium text-primary">
          Week {currentWeek} of {totalWeeks}
        </span>
      </div>
    </div>
  );
}
