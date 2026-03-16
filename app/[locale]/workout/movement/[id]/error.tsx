'use client';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function WorkoutError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Workout');
  const tCommon = useTranslations('Common');

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="w-12 h-12 text-muted-foreground/40 mb-6" />
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        {tCommon('error')}
      </p>
      <h1 className="text-3xl font-bold tracking-tight leading-tight mb-2">
        {t('errorTitle')}
      </h1>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs">
        {t('errorDescription')}
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button className="rounded-xl h-12 font-semibold" onClick={reset}>
          {t('tryAgain')}
        </Button>
        <Button asChild variant="ghost" className="rounded-xl h-11 text-muted-foreground">
          <Link href="/">{t('backToHome')}</Link>
        </Button>
      </div>
    </div>
  );
}
