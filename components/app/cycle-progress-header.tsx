'use client';

import { useTranslations } from 'next-intl';

interface CycleInfo {
  currentWeek: number;
  totalWeeks: number;
  weeksCompleted: number;
}

function getGreetingKey(): 'goodMorning' | 'goodAfternoon' | 'goodEvening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'goodMorning';
  if (hour < 18) return 'goodAfternoon';
  return 'goodEvening';
}

export function CycleProgressHeader({ cycleInfo }: { cycleInfo: CycleInfo }) {
  const { currentWeek, totalWeeks } = cycleInfo;
  const t = useTranslations('CycleProgress');

  return (
    <div className="px-4 pt-8 pb-4">
      <h1 className="text-4xl font-bold tracking-tight text-foreground leading-none">
        {t(getGreetingKey())}
      </h1>
      <div className="mt-4 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/50" />
          {t('weekOf', { current: currentWeek, total: totalWeeks })}
        </span>
      </div>
    </div>
  );
}
