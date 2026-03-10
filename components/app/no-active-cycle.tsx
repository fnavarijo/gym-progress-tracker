import Link from 'next/link';
import { Dumbbell, Sprout, ChevronRight } from 'lucide-react';

export function NoCycleState() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Get Started
      </p>
      <Link href="/cycle/new">
        <div className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3.5 transition-colors hover:bg-accent cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">I know my max PRs</p>
            <p className="text-xs text-muted-foreground">Jump straight into your cycle</p>
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
            <p className="font-semibold text-sm">I&apos;m new to weightlifting</p>
            <p className="text-xs text-muted-foreground">Start with an evaluation week</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </div>
      </Link>
    </div>
  );
}
