import { Suspense } from 'react';
import { BackButton } from '@/components/app/back-button';
import { PRSection } from '@/components/app/pr-section';

function CycleFormSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="h-16 rounded-xl bg-muted animate-pulse" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export default function NewCyclePage() {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col">
      <div className="bg-gradient-to-b from-primary/8 to-transparent">
        <nav className="px-4 pt-6 pb-2 flex items-center gap-2">
          <BackButton />
        </nav>
        <div className="px-4 pt-2 pb-4">
          <h1 className="text-4xl font-bold tracking-tight leading-none">Create New Cycle</h1>
        </div>
      </div>
      <div className="px-4 flex flex-col gap-8 flex-1">
        <Suspense fallback={<CycleFormSkeleton />}>
          <PRSection />
        </Suspense>
      </div>
    </div>
  );
}
