import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { Suspense } from 'react';

type Params = Promise<{ locale: string }>;

async function SignUpSuccessContent() {
  const t = await getTranslations('Auth.signUpSuccess');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {t('body')}
        </p>
      </CardContent>
    </Card>
  );
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Suspense>
            <SignUpSuccessContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
