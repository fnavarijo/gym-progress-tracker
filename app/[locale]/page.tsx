import { Suspense } from 'react';
import { NoCycleState } from '@/components/app/no-active-cycle';
import { DashboardGreeting } from '@/components/app/dashboard-greeting';
import { WorkoutProgress } from '@/components/app/workout-progress';
import { getUserActiveCycle } from '@/api/cycle/get-user-active-cycle';
import { hasUserPastCycles } from '@/api/cycle/has-user-past-cycles';
import { LogoutButton } from '@/components/logout-button';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { hasLocale } from 'next-intl';
import { notFound, redirect } from 'next/navigation';

type Params = Promise<{ locale: string }>;

function WorkoutProgressSkeleton() {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col animate-pulse">
      <div className="h-20 bg-muted rounded-xl mx-4 mt-4" />
      <div className="flex-1 px-4 pt-6 flex flex-col gap-3">
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-14 bg-muted rounded-xl" />
        <div className="h-14 bg-muted rounded-xl" />
        <div className="h-14 bg-muted rounded-xl" />
        <div className="h-14 bg-muted rounded-xl" />
        <div className="h-14 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

export default async function HomePage({ params }: { params: Params }) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations('Home');
  const activeCycle = await getUserActiveCycle();

  if (!activeCycle) {
    const hasPastCycles = await hasUserPastCycles();
    if (hasPastCycles) redirect(getPathname({ href: '/cycle/new', locale }));

    return (
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        {/* Branding panel — desktop only */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-primary/8 via-primary/5 to-transparent border-r flex-col justify-center px-12 lg:px-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Momentum
          </p>
          <h2 className="text-5xl font-bold tracking-tight leading-tight">
            {t('brandingHeadline')}<br />{t('brandingHeadline2')}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-sm">
            {t('brandingDescription')}
          </p>
        </div>

        {/* Action panel */}
        <div className="w-full md:w-[420px] md:shrink-0 flex flex-col min-h-screen md:h-screen md:overflow-y-auto">
          <div className="bg-gradient-to-b from-primary/8 to-transparent md:bg-none">
            <Suspense fallback={<div className="px-4 pt-8 pb-4 h-24" />}>
              <DashboardGreeting />
            </Suspense>
          </div>
          <main className="flex-1 flex flex-col justify-start px-4 md:px-6 pt-2 pb-24 md:pb-8 md:pt-2">
            <NoCycleState />
          </main>
          <div className="sticky md:relative bottom-0 px-4 md:px-6 pb-6 pt-10 flex flex-col gap-2 bg-gradient-to-t from-background via-background/95 to-transparent md:bg-none md:pt-0">
            <LogoutButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<WorkoutProgressSkeleton />}>
      <WorkoutProgress cycle={activeCycle} />
    </Suspense>
  );
}
