import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function WorkoutNotFound() {
  const t = await getTranslations('Workout');

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <Dumbbell className="w-12 h-12 text-muted-foreground/40 mb-6" />
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        404
      </p>
      <h1 className="text-3xl font-bold tracking-tight leading-tight mb-2">
        {t('notFoundTitle')}
      </h1>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs">
        {t('notFoundDescription')}
      </p>
      <Button asChild className="rounded-xl h-12 px-6 font-semibold">
        <Link href="/">{t('backToHome')}</Link>
      </Button>
    </div>
  );
}
