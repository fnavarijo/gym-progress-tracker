import { Calendar, Target, TrendingUp } from 'lucide-react';
import { BackButton } from '@/components/app/back-button';
import { CardContainer } from '@/components/ui/card-container';
import { Button } from '@/components/ui/button';

export default function CycleOnboardingPage() {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col">
      <div className="bg-gradient-to-b from-primary/8 to-transparent">
        <nav className="px-4 pt-6 pb-2 flex items-center gap-2">
          <BackButton />
        </nav>
        <div className="px-4 pt-2 pb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Getting Started
          </p>
          <h1 className="text-4xl font-bold tracking-tight leading-none">Evaluation Week</h1>
        </div>
      </div>
      <main className="flex-1 overflow-y-auto px-4 pb-40 flex flex-col gap-6">
        <CardContainer>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Before starting your training program, you&apos;ll complete one week of evaluation
            to find your personal records (PRs) for each lift. These numbers are used to
            calculate all your future training weights automatically.
          </p>
        </CardContainer>
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            What to Expect
          </h2>
          <div className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">1-week duration</p>
              <p className="text-xs text-muted-foreground">Complete all evaluation sets in a week</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Find your max PR</p>
              <p className="text-xs text-muted-foreground">Test each lift to find your one-rep max</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Unlock your training plan</p>
              <p className="text-xs text-muted-foreground">Your PRs power your personalized program</p>
            </div>
          </div>
        </section>
      </main>
      <div className="sticky bottom-0 px-4 pb-6 pt-10 bg-gradient-to-t from-background via-background/95 to-transparent">
        {/* TODO: wire up to create evaluation week */}
        <Button className="rounded-xl h-14 text-base font-semibold w-full">
          Start Evaluation Week
        </Button>
      </div>
    </div>
  );
}
