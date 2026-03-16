import { notFound } from 'next/navigation';
import { getUserActiveCycle } from '@/api/cycle/get-user-active-cycle';
import { getCycleWorkouts } from '@/api/workout/get-cycle-workouts';
import { CycleHeatmap } from '@/components/app/cycle-heatmap';
import { CycleStats } from '@/components/app/cycle-stats';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';

type Params = Promise<{ locale: string }>;

export default async function CycleSummaryPage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const cycle = await getUserActiveCycle();
  if (!cycle) notFound();

  const workouts = await getCycleWorkouts(cycle.id);
  const t = await getTranslations('Cycle.summary');

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col">
      <div className="bg-gradient-to-b from-primary/8 to-transparent">
        <div className="px-4 pt-8 pb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            {t('activeCycle')}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground leading-none">
            {t('fullCycleView')}
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/50" />
              {t('weekOf', { current: cycle.currentWeek, total: cycle.totalWeeks })}
            </span>
            <span className="text-sm text-muted-foreground">
              {t('daysRemaining', { days: cycle.daysRemaining })}
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-40">
        <CycleStats
          workouts={workouts}
          currentWeek={cycle.currentWeek}
          totalWeeks={cycle.totalWeeks}
        />
        <CycleHeatmap
          workouts={workouts}
          totalWeeks={cycle.totalWeeks}
          currentWeek={cycle.currentWeek}
        />
      </main>

      <div className="sticky bottom-0 px-4 pb-6 pt-10 flex flex-col gap-2 bg-gradient-to-t from-background via-background/95 to-transparent">
        <Button
          asChild
          variant="ghost"
          className="w-full rounded-xl h-11 text-muted-foreground"
          size="lg"
        >
          <Link href="/">{t('backToDashboard')}</Link>
        </Button>
      </div>
    </div>
  );
}
