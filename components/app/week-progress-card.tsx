'use client';

import { CardContainer } from '@/components/ui/card-container';
import { useTranslations } from 'next-intl';

interface WeekProgress {
  completed: number;
  total: number;
}

export function WeekProgressCard({ weekProgress }: { weekProgress: WeekProgress }) {
  const { completed, total } = weekProgress;
  const progressPct = total > 0 ? (completed / total) * 100 : 0;
  const t = useTranslations('WeekProgress');

  return (
    <CardContainer className="gap-4">
      <div className="flex items-baseline gap-1">
        <span className="text-5xl font-bold tabular-nums text-foreground leading-none">
          {completed}
        </span>
        <span className="text-xl text-muted-foreground font-medium">/ {total}</span>
      </div>
      <p className="text-sm text-muted-foreground -mt-2">{t('workoutsThisWeek')}</p>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </CardContainer>
  );
}
