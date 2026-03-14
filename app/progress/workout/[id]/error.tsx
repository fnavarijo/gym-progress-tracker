'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function WorkoutError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="w-12 h-12 text-muted-foreground/40 mb-6" />
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Error
      </p>
      <h1 className="text-3xl font-bold tracking-tight leading-tight mb-2">
        Something went wrong
      </h1>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs">
        We couldn&apos;t load this workout. Try again or go back home.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button className="rounded-xl h-12 font-semibold" onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="ghost" className="rounded-xl h-11 text-muted-foreground">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
