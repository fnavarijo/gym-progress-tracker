import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';
import { CardContainer } from '@/components/ui/card-container';

interface Workout {
  id: string;
  name: string;
  topSet: number;
  completed: boolean;
}

export function WorkoutItem({ workout }: { workout: Workout }) {
  const { id, name, topSet, completed } = workout;

  const content = (
    <CardContainer className="flex-row items-center gap-4 p-4">
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{name}</p>
        <p className="text-sm text-muted-foreground">Top set: {topSet} lb</p>
      </div>
      {completed ? (
        <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
      ) : (
        <Circle className="w-6 h-6 text-muted-foreground shrink-0" />
      )}
    </CardContainer>
  );

  if (!completed) {
    return <Link href={`/progress/workout/${id}`}>{content}</Link>;
  }

  return content;
}
