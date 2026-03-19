'use client';

import { useTranslations } from 'next-intl';
import { CycleMovementEntry } from '@/api/workout/get-cycle-movements-for-week';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

function getTodayDayOfWeek(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 7 : jsDay;
}

export function TodayCta({ movements }: { movements: CycleMovementEntry[] }) {
  const todayDayOfWeek = getTodayDayOfWeek();
  const t = useTranslations('CycleProgress');

  const todayWorkouts = movements.filter((m) => m.dayOfWeek === todayDayOfWeek);
  const firstIncompleteToday = todayWorkouts.find((m) => !m.completed);
  const todayAllDone = todayWorkouts.length > 0 && todayWorkouts.every((m) => m.completed);

  if (firstIncompleteToday) {
    return (
      <Button asChild className="w-full rounded-xl h-14 text-base font-semibold" size="lg">
        <Link href={`/workout/movement/${firstIncompleteToday.cycleMovementId}`}>
          {t('startTodaysLift')}
        </Link>
      </Button>
    );
  }

  return (
    <Button disabled className="w-full rounded-xl h-14 text-base font-semibold" size="lg">
      {todayAllDone ? t('todaysLiftDone') : t('noLiftScheduled')}
    </Button>
  );
}
