import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getAllPlanDetails } from '@/api/plan/get-all-plan-details';
import { getAllMovements } from '@/api/movement/get-all-movements';
import { PlansPageClient } from '@/components/app/plans-page-client';

type Params = Promise<{ locale: string }>;

export default async function PlansPage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('Plans');

  const [planDetails, movements] = await Promise.all([getAllPlanDetails(), getAllMovements()]);

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col">
      <header className="px-4 pt-8 pb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
          {t('eyebrow')}
        </p>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </header>

      <main className="px-4 pb-24 flex flex-col gap-3 flex-1">
        <PlansPageClient planDetails={planDetails} movements={movements} />
      </main>
    </div>
  );
}
