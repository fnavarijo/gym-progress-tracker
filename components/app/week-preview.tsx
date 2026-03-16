import { PlanMovement } from '@/api/plan/get-plan-movements';
import { ExercisePreviewCard } from './exercise-preview-card';
import { getTranslations } from 'next-intl/server';

interface WeekPreviewProps {
  movements: PlanMovement[];
  prs: Record<string, number>;
}

export async function WeekPreview({ movements, prs }: WeekPreviewProps) {
  const t = await getTranslations('WeekPreview');

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{t('title')}</h2>
      <p className="text-xs text-muted-foreground mb-3">
        {t('description')}
      </p>
      <div className="flex flex-col gap-3">
        {movements.map((movement) => (
          <ExercisePreviewCard key={movement.id} name={movement.name} pr={prs[movement.name] ?? 0} />
        ))}
      </div>
    </section>
  );
}
