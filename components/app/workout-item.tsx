import Link from 'next/link';
import { CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAY_ABBR = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Workout {
  id: number;
  name: string;
  topSet: number;
  completed: boolean;
  dayOfWeek: number;
}

export function WorkoutItem({ workout, todayDayOfWeek }: { workout: Workout; todayDayOfWeek: number }) {
  const { id, name, topSet, completed, dayOfWeek } = workout;
  const dayLabel = DAY_ABBR[dayOfWeek] ?? '';
  const locked   = !completed && dayOfWeek !== 0 && dayOfWeek > todayDayOfWeek;

  const content = (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border bg-card px-4 py-3.5 transition-colors',
        locked     && 'opacity-40 cursor-not-allowed',
        completed  && 'opacity-60',
        !locked && !completed && 'hover:bg-accent cursor-pointer',
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
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground">
            Top set: <span className="font-semibold text-foreground">{topSet} lb</span>
          </p>
          {dayLabel && (
            <>
              <span className="text-xs text-muted-foreground/40">•</span>
              <span className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                !locked && !completed
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground',
              )}>
                {dayLabel}
              </span>
            </>
          )}
        </div>
      </div>
      {completed && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
      {locked    && <Lock className="w-4 h-4 text-muted-foreground shrink-0" />}
      {!locked && !completed && <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />}
    </div>
  );

  if (!locked && !completed) {
    return <Link href={`/progress/workout/${id}`}>{content}</Link>;
  }

  return content;
}
