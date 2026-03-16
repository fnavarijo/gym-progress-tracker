import { Dumbbell, Sprout, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export async function NoCycleState() {
  const t = await getTranslations('NoCycle');

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t('getStarted')}
      </p>
      <Link href="/cycle/new">
        <div className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3.5 transition-colors hover:bg-accent cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{t('knowMyPrs')}</p>
            <p className="text-xs text-muted-foreground">{t('knowMyPrsDescription')}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </div>
      </Link>
      <Link href="/cycle/onboarding">
        <div className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3.5 transition-colors hover:bg-accent cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sprout className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{t('newToWeightlifting')}</p>
            <p className="text-xs text-muted-foreground">{t('newToWeightliftingDescription')}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </div>
      </Link>
    </div>
  );
}
