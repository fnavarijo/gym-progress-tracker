import { Cycle } from '@/api/cycle/get-user-active-cycle';
import { getCycleMovementsForWeek } from '@/api/workout/get-cycle-movements-for-week';
import { CycleProgressHeader } from '@/components/app/cycle-progress-header';
import { WeekProgressCard } from '@/components/app/week-progress-card';
import { WorkoutList } from '@/components/app/workout-list';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/logout-button';
import { LocaleSwitcher } from '@/components/app/locale-switcher';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

interface WorkoutProgressProps {
  cycle: Cycle;
}

export async function WorkoutProgress({ cycle }: WorkoutProgressProps) {
  const movements = await getCycleMovementsForWeek(cycle.id, cycle.planId, cycle.currentWeek);
  const t = await getTranslations('CycleProgress');

  // ISO weekday: 1 = Monday … 7 = Sunday
  const jsDay = new Date().getDay();
  const todayDayOfWeek = jsDay === 0 ? 7 : jsDay;

  const weekProgress = {
    completed: movements.filter((m) => m.completed).length,
    total: movements.length,
  };

  const todayWorkouts        = movements.filter((m) => m.dayOfWeek === todayDayOfWeek);
  const firstIncompleteToday = todayWorkouts.find((m) => !m.completed);
  const todayAllDone         = todayWorkouts.length > 0 && todayWorkouts.every((m) => m.completed);

  const cycleInfo = {
    currentWeek: cycle.currentWeek,
    totalWeeks: cycle.totalWeeks,
    weeksCompleted: cycle.currentWeek - 1,
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col">
      <div className="bg-gradient-to-b from-primary/8 to-transparent">
        <CycleProgressHeader cycleInfo={cycleInfo} />
      </div>
      <main className="flex-1 overflow-y-auto px-4 pb-40">
        <section>
          <WeekProgressCard weekProgress={weekProgress} />
        </section>
        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            {t('thisWeeksLifts')}
          </h2>
          <WorkoutList movements={movements} todayDayOfWeek={todayDayOfWeek} />
        </section>
      </main>
      <div className="sticky bottom-0 px-4 pb-6 pt-10 flex flex-col gap-2 bg-gradient-to-t from-background via-background/95 to-transparent">
        {firstIncompleteToday ? (
          <Button asChild className="w-full rounded-xl h-14 text-base font-semibold" size="lg">
            <Link href={`/workout/movement/${firstIncompleteToday.cycleMovementId}`}>
              {t('startTodaysLift')}
            </Link>
          </Button>
        ) : (
          <Button disabled className="w-full rounded-xl h-14 text-base font-semibold" size="lg">
            {todayAllDone ? t('todaysLiftDone') : t('noLiftScheduled')}
          </Button>
        )}
        <Button
          asChild
          variant="ghost"
          className="w-full rounded-xl h-11 text-muted-foreground"
          size="lg"
        >
          <Link href="/cycle/summary">{t('viewFullCycle')}</Link>
        </Button>
        <LogoutButton />
        <div className="flex justify-center">
          <LocaleSwitcher />
        </div>
      </div>
    </div>
  );
}
