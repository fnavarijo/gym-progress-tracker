import { Skeleton } from '@/components/ui/skeleton';

function WorkoutItemSkeleton() {
  return (
    <div className="bg-card p-4 flex flex-row items-center gap-4 rounded-xl border">
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-6 w-6 rounded-full shrink-0" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col">
      {/* CycleProgressHeader skeleton */}
      <div className="px-4 pt-6 pb-2">
        <Skeleton className="h-10 w-48" />
        <div className="mt-2">
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 pb-32">
        {/* WeekProgressCard skeleton */}
        <section>
          <Skeleton className="h-6 w-40 mb-3" />
          <div className="bg-card p-4 flex flex-col gap-3 rounded-xl border">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-7 w-12" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </section>

        {/* WorkoutList skeleton */}
        <section className="mt-4">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <WorkoutItemSkeleton key={i} />
            ))}
          </div>
        </section>
      </main>

      {/* Sticky bottom buttons skeleton */}
      <div className="sticky bottom-0 bg-background px-4 pb-6 pt-2 flex flex-col gap-3">
        <Skeleton className="h-11 w-full rounded-md" />
        <Skeleton className="h-11 w-full rounded-md" />
      </div>
    </div>
  );
}
