import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { OptionGroup } from '@/components/ui/option';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';

type Params = Promise<{ locale: string }>;

export default async function ProgressPage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('Progress.start');

  return (
    <main className="w-full min-h-screen flex items-center justify-center">
      <article className="bg-card rounded-md p-4 border-border border-[1px]">
        <div className="text-center">
          <h1 className="text-4xl">{t('title')}</h1>
          <p className="">{t('description')}</p>
        </div>
        <div className="mt-8">
          <h2>{t('cycleDuration')}</h2>
          <OptionGroup
            className="mt-4"
            name="cycleOptions"
            options={[
              { id: '4', value: '4' },
              { id: '5', value: '5' },
              { id: '6', value: '6' },
            ]}
          />
        </div>
        <div className="mt-6">
          <Button>{t('startCycle')}</Button>
        </div>
      </article>
    </main>
  );
}
