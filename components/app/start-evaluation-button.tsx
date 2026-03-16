'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { createOnboardingCycle } from '@/api/cycle/create-onboarding-cycle';
import { useTranslations } from 'next-intl';

export function StartEvaluationButton({ planId }: { planId: number }) {
  const router = useRouter();
  const t = useTranslations('Cycle.onboarding');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const result = await createOnboardingCycle({ planId, date: today });
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push('/');
  }

  return (
    <>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
      <Button
        className="rounded-xl h-14 text-base font-semibold w-full"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? t('starting') : t('startEvaluationWeek')}
      </Button>
    </>
  );
}
