import { CardContainer } from '@/components/ui/card-container';

interface ExercisePreviewCardProps {
  name: string;
  pr: number;
}

function calcWeight(pr: number, pct: number): number {
  return Math.round((pr * pct) / 2.5) * 2.5;
}

const SETS = [
  { label: 'Set 1', reps: 5, pct: 0.7 },
  { label: 'Set 2', reps: 5, pct: 0.75 },
  { label: 'Set 3', reps: 5, pct: 0.8 },
] as const;

export function ExercisePreviewCard({ name, pr }: ExercisePreviewCardProps) {
  if (pr === 0) {
    return (
      <CardContainer className="gap-2">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-center text-sm text-muted-foreground">
          Enter PR to preview working sets
        </p>
      </CardContainer>
    );
  }

  return (
    <CardContainer className="gap-3">
      <p className="text-sm font-semibold">{name}</p>
      <div className="bg-secondary rounded-lg overflow-hidden">
        {SETS.map((set, index) => (
          <div key={set.label}>
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm font-medium w-12">{set.label}</span>
              <span className="text-sm text-muted-foreground flex-1 text-center">
                {set.reps} reps @ {Math.round(set.pct * 100)}%
              </span>
              <span className="text-sm font-semibold text-primary w-16 text-right">
                {calcWeight(pr, set.pct)} lb
              </span>
            </div>
            {index < SETS.length - 1 && (
              <div className="mx-3 border-b border-border" />
            )}
          </div>
        ))}
      </div>
    </CardContainer>
  );
}
