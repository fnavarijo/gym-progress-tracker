import { cn } from '@/lib/utils';

export function CardContainer({
  className,
  children,
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground p-4 flex flex-col gap-6 rounded-xl border',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <h4
      data-slot="card-title"
      className={cn('leading-none', className)}
      {...props}
    />
  );
}
