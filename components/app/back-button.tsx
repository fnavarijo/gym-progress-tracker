'use client';

import { useRouter } from '@/i18n/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export function BackButton() {
  const router = useRouter();
  const t = useTranslations('BackButton');

  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1 px-2 text-muted-foreground hover:text-foreground"
      onClick={() => router.back()}
    >
      <ChevronLeft className="size-4" />
      <span className="text-sm">{t('label')}</span>
    </Button>
  );
}
