import Link from 'next/link';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Workout {
  id: number;
  name: string;
  topSet: number;
  completed: boolean;
}

export function WorkoutItem({ workout }: { workout: Workout }) {
  const { id, name, topSet, completed } = workout;

  const content = (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border bg-card px-4 py-3.5 transition-colors',
        completed
          ? 'opacity-60'
          : 'hover:bg-accent cursor-pointer',
      )}
    >
      <div
        className={cn(
          'w-1 self-stretch rounded-full shrink-0',
          completed ? 'bg-primary' : 'bg-muted-foreground/30',
        )}
      />
      <div className="flex-1 min-w-0">
        <p className={cn('font-semibold truncate', completed && 'line-through decoration-muted-foreground/50')}>
          {name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Top set:{' '}
          <span className="font-semibold text-foreground">{topSet} lb</span>
        </p>
      </div>
      {completed ? (
        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
      ) : (
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      )}
    </div>
  );

  if (!completed) {
    return <Link href={`/progress/workout/${id}`}>{content}</Link>;
  }

  return content;
}
