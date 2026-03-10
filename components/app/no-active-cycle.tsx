import { Dumbbell } from 'lucide-react';
import { CardContainer } from '@/components/ui/card-container';

export function NoCycleState() {
  return (
    <CardContainer className="items-center text-center gap-5 py-8">
      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
        <Dumbbell className="w-10 h-10 text-primary" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold">No Active Cycle</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Start your first strength cycle to track your progress and build
          consistent momentum.
        </p>
      </div>
    </CardContainer>
  );
}
