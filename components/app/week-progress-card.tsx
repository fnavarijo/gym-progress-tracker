import { CardContainer } from '@/components/ui/card-container';

interface WeekProgress {
  completed: number;
  total: number;
}

export function WeekProgressCard({ weekProgress }: { weekProgress: WeekProgress }) {
  const { completed, total } = weekProgress;
  const progressPct = (completed / total) * 100;

  return (
    <CardContainer className="gap-3">
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground text-sm">Workouts Completed</span>
        <span>
          <span className="text-primary text-2xl font-bold">{completed}</span>
          <span className="text-muted-foreground text-sm"> / {total}</span>
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </CardContainer>
  );
}
