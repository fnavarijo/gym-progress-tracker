import { notFound } from 'next/navigation';
import { Calendar, Target, TrendingUp } from 'lucide-react';
import { BackButton } from '@/components/app/back-button';
import { CardContainer } from '@/components/ui/card-container';
import { getPlanBySlug } from '@/api/plan/get-plan-by-slug';
import { StartEvaluationButton } from '@/components/app/start-evaluation-button';

export default async function CycleOnboardingPage() {
  const plan = await getPlanBySlug('onboarding');
  if (!plan) notFound();
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Branding panel — desktop only */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-primary/8 via-primary/5 to-transparent border-r flex-col justify-center px-12 lg:px-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Momentum
        </p>
        <h2 className="text-5xl font-bold tracking-tight leading-tight">
          Start from zero.<br />Build from there.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-sm">
          One week of evaluation sets your baseline. From there, your program is fully personalized to you.
        </p>
      </div>

      {/* Action panel */}
      <div className="w-full md:w-[420px] md:shrink-0 flex flex-col min-h-screen md:h-screen md:overflow-y-auto">
        <div className="bg-gradient-to-b from-primary/8 to-transparent md:bg-none">
          <nav className="px-4 md:px-6 pt-6 pb-2 flex items-center gap-2">
            <BackButton />
          </nav>
          <div className="px-4 md:px-6 pt-2 pb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Getting Started
            </p>
            <h1 className="text-3xl font-bold tracking-tight leading-tight">Evaluation Week</h1>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto px-4 md:px-6 pb-24 md:pb-8 flex flex-col gap-6">
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
        <div className="sticky md:relative bottom-0 px-4 md:px-6 pb-6 pt-10 bg-gradient-to-t from-background via-background/95 to-transparent md:bg-none md:pt-0">
          <StartEvaluationButton planId={plan.id} />
        </div>
      </div>
    </div>
  );
}
