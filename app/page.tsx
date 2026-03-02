import { requireAuth } from '@/lib/auth';
import { CycleProgressHeader } from '@/components/app/cycle-progress-header';
import { WeekProgressCard } from '@/components/app/week-progress-card';
import { WorkoutList } from '@/components/app/workout-list';
import { NoCycleState } from '@/components/app/no-active-cycle';

interface Workout {
  id: string;
  name: string;
  topSet: number;
  completed: boolean;
}

interface WeekProgress {
  completed: number;
  total: number;
}

interface CycleInfo {
  currentWeek: number;
  totalWeeks: number;
  weeksCompleted: number;
}

const cycleInfo: CycleInfo = {
  currentWeek: 2,
  totalWeeks: 6,
  weeksCompleted: 2,
};
const weekProgress: WeekProgress = { completed: 2, total: 5 };
const workouts: Workout[] = [
  { id: '1', name: 'Back Squat', topSet: 20, completed: true },
  { id: '2', name: 'Deadlift', topSet: 20, completed: true },
  { id: '3', name: 'Strict Press', topSet: 45, completed: false },
  { id: '4', name: 'Clean', topSet: 35, completed: false },
];

function getFirstName(claims: Record<string, unknown>): string {
  const metadata = claims.user_metadata as Record<string, unknown> | undefined;
  const fullName =
    (metadata?.full_name as string | undefined) ??
    (metadata?.name as string | undefined) ??
    (claims.email as string | undefined)?.split('@')[0] ??
    'there';
  return fullName.split(' ')[0];
}

export default async function HomePage() {
  const claims = await requireAuth();
  const firstName = getFirstName(claims as Record<string, unknown>);

  // TODO: replace with real DB lookup
  const hasActiveCycle = false;

  if (!hasActiveCycle) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col">
        <header className="px-4 pt-6 pb-4">
          <h1 className="text-4xl font-bold text-foreground break-all">
            Hey, {firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">Ready to build momentum?</p>
        </header>
        <main className="flex-1 flex flex-col justify-center px-4 pb-8">
          <div className="flex flex-col gap-4">
            <NoCycleState />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <CycleProgressHeader cycleInfo={cycleInfo} />
      <main className="px-4 pt-6 pb-8 flex flex-col gap-6">
        <section>
          <h2 className="text-xl font-bold mb-3">This Week&apos;s Progress</h2>
          <WeekProgressCard weekProgress={weekProgress} />
        </section>
        <WorkoutList workouts={workouts} />
      </main>
    </div>
  );
}
