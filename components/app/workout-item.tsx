import Link from 'next/link';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { CardContainer } from '@/components/ui/card-container';

interface Workout {
  id: string;
  name: string;
  topSet: number;
  completed: boolean;
}

export function WorkoutItem({ workout }: { workout: Workout }) {
  const { id, name, topSet, completed } = workout;

  return (
    <CardContainer className="flex-row items-center gap-4 p-4">
      {completed ? (
        <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
      ) : (
        <Circle className="w-6 h-6 text-muted-foreground shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{name}</p>
        <p className="text-sm text-muted-foreground">Top set: {topSet} lb</p>
      </div>
      {!completed && (
        <Link href={`/progress/workout/${id}`} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
      )}
    </CardContainer>
  );
}
