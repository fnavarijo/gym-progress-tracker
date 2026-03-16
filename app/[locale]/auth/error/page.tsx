import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';

type Params = Promise<{ locale: string }>;

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;
  const t = await getTranslations('Auth.error');

  return (
    <>
      {params?.error ? (
        <p className="text-sm text-muted-foreground">
          {t('codeError', { error: params.error })}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t('unspecified')}
        </p>
      )}
    </>
  );
}

async function ErrorCard() {
  const t = await getTranslations('Auth.error');
  return (
    <CardHeader>
      <CardTitle className="text-2xl">
        {t('title')}
      </CardTitle>
    </CardHeader>
  );
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ error: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <Suspense>
              <ErrorCard />
            </Suspense>
            <CardContent>
              <Suspense>
                <ErrorContent searchParams={searchParams} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
