import { getTranslations } from 'next-intl/server';
import { PlanSummary } from '@/api/plan/get-all-plans';

interface PlansListProps {
  plans: PlanSummary[];
}

export async function PlansList({ plans }: PlansListProps) {
  const t = await getTranslations('Plans');

  if (plans.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        {t('noPlansYet')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3.5"
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{plan.name}</p>
            {plan.description && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{plan.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {t('weekCount', { count: plan.lengthWeeks })}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {t('movementCount', { count: plan.movementCount })}
            </span>
            {plan.isSystem && (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                {t('system')}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
