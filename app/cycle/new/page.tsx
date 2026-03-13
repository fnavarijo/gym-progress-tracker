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
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Branding panel — desktop only */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-primary/8 via-primary/5 to-transparent border-r flex-col justify-center px-12 lg:px-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Momentum
        </p>
        <h2 className="text-5xl font-bold tracking-tight leading-tight">
          New cycle,<br />new goals.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-sm">
          Enter your current PRs and pick a start date to generate your personalized training program.
        </p>
      </div>

      {/* Action panel */}
      <div className="w-full md:w-[420px] md:shrink-0 flex flex-col min-h-screen md:h-screen md:overflow-y-auto">
        <div className="bg-gradient-to-b from-primary/8 to-transparent md:bg-none">
          <nav className="px-4 md:px-6 pt-6 pb-2 flex items-center gap-2">
            <BackButton />
          </nav>
          <div className="px-4 md:px-6 pt-2 pb-4">
            <h1 className="text-3xl font-bold tracking-tight leading-tight">
              Create New Cycle
            </h1>
          </div>
        </div>
        <div className="px-4 md:px-6 flex flex-col gap-8 flex-1">
          <Suspense fallback={<CycleFormSkeleton />}>
            <PRSection />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
