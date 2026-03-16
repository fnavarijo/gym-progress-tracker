import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';

type Params = Promise<{ locale: string }>;

export default async function PlansPage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('Plans');

  return (
    <article>
      <h1>{t('title')}</h1>
      <section>
        <h2>{t('listTitle')}</h2>
        <div></div>
      </section>
    </article>
  );
}
