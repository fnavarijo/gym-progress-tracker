'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BackButton() {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1 px-2 text-muted-foreground hover:text-foreground"
      onClick={() => router.back()}
    >
      <ChevronLeft className="size-4" />
      <span className="text-sm">Back</span>
    </Button>
  );
}
