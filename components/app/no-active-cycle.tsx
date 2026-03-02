import Link from 'next/link';
import { Dumbbell } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CardContainer } from '@/components/ui/card-container';

export function NoCycleState() {
  return (
    <>
      <CardContainer className="items-center text-center gap-5 py-8">
        <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center">
          <Dumbbell className="w-10 h-10 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">No Active Cycle</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Start your first 6-week strength cycle to track your progress and
            build consistent momentum.
          </p>
        </div>
      </CardContainer>
      <Button className="w-full h-14 text-base rounded-2xl" asChild>
        <Link href="/cycle/start">Create Cycle</Link>
      </Button>
    </>
  );
}
