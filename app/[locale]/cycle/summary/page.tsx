import { notFound } from 'next/navigation';
import { getUserActiveCycle } from '@/api/cycle/get-user-active-cycle';
import { getCycleWorkouts } from '@/api/workout/get-cycle-workouts';
import { getPlanMovements } from '@/api/plan/get-plan-movements';
import { CycleHeatmap } from '@/components/app/cycle-heatmap';
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

  const [workouts, planMovements] = await Promise.all([
    getCycleWorkouts(cycle.id),
    getPlanMovements(cycle.planId),
  ]);
  const t = await getTranslations('Cycle.summary');

  return (
    <div className="bg-background max-w-md mx-auto">
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

      <main className="pb-8">
        <CycleHeatmap
          workouts={workouts}
          totalWeeks={cycle.totalWeeks}
          currentWeek={cycle.currentWeek}
          planMovements={planMovements}
        />
      </main>

      <div className="px-4 pb-8 pt-4 flex flex-col gap-2">
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
