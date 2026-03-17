'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PlanDetail } from '@/api/plan/get-all-plan-details';
import { Movement } from '@/api/movement/get-all-movements';
import { PlanCreationWizard } from './plan-creation-wizard';

interface PlansPageClientProps {
  planDetails: PlanDetail[];
  movements: Movement[];
}

export function PlansPageClient({ planDetails, movements }: PlansPageClientProps) {
  const t = useTranslations('Plans');
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);

  const editingPlan = editingPlanId !== null
    ? planDetails.find((plan) => plan.id === editingPlanId)
    : undefined;

  return (
    <div className="flex flex-col gap-3">
      {/* Plan list */}
      {planDetails.length === 0 && editingPlanId === null && (
        <p className="text-sm text-muted-foreground text-center py-6">{t('noPlansYet')}</p>
      )}

      {planDetails.map((plan) => {
        if (editingPlanId === plan.id) {
          return (
            <PlanCreationWizard
              key={plan.id}
              movements={movements}
              initialPlan={plan}
              onClose={() => setEditingPlanId(null)}
            />
          );
        }

        return (
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
                {t('movementCount', { count: plan.planMovements.length })}
              </span>
              {plan.isSystem && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {t('system')}
                </span>
              )}
              <button
                onClick={() => setEditingPlanId(plan.id)}
                className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
              >
                {t('editPlan')}
              </button>
            </div>
          </div>
        );
      })}

      {/* Create wizard — hidden while editing an existing plan */}
      {editingPlanId === null && (
        <PlanCreationWizard movements={movements} />
      )}
    </div>
  );
}
