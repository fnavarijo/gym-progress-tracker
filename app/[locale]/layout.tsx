import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { LangSetter } from '@/components/app/lang-setter';
import { Suspense } from 'react';
import esMessages from '@/messages/es.json';
import enMessages from '@/messages/en.json';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const messagesMap: Record<string, typeof esMessages> = {
  es: esMessages,
  en: enMessages,
};

async function LocaleProviders({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = messagesMap[locale] ?? esMessages;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LangSetter locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <Suspense>
      <LocaleProviders locale={locale}>
        {children}
      </LocaleProviders>
    </Suspense>
  );
}
