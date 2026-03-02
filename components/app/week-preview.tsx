import { PlanMovement } from '@/api/plan/get-plan-movements';
import { ExercisePreviewCard } from './exercise-preview-card';

interface WeekPreviewProps {
  movements: PlanMovement[];
  prs: Record<string, number>;
}

export function WeekPreview({ movements, prs }: WeekPreviewProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold">Week 1 Preview</h2>
      <p className="text-muted-foreground text-sm mb-3">
        Calculated working sets for your first week
      </p>
      <div className="flex flex-col gap-3">
        {movements.map((m) => (
          <ExercisePreviewCard key={m.id} name={m.name} pr={prs[m.name] ?? 0} />
        ))}
      </div>
    </section>
  );
}
