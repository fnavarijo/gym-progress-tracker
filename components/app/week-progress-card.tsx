import { CardContainer } from '@/components/ui/card-container';

interface WeekProgress {
  completed: number;
  total: number;
}

export function WeekProgressCard({ weekProgress }: { weekProgress: WeekProgress }) {
  const { completed, total } = weekProgress;
  const progressPct = (completed / total) * 100;
  const remaining = total - completed;

  return (
    <CardContainer className="gap-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            This Week
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold tabular-nums text-foreground leading-none">
              {completed}
            </span>
            <span className="text-xl text-muted-foreground font-medium">/ {total}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">workouts done</p>
        </div>
        {remaining > 0 && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {remaining} left
          </span>
        )}
        {remaining === 0 && (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            Complete!
          </span>
        )}
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </CardContainer>
  );
}
