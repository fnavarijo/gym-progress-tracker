'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Movement } from '@/api/movement/get-all-movements';
import { PlanDetail } from '@/api/plan/get-all-plan-details';
import {
  createPlan,
  CreatePlanMovementInput,
  CreatePlanRoutineInput,
} from '@/api/plan/create-plan';
import { updatePlan } from '@/api/plan/update-plan';
import { Checkbox } from '@/components/ui/checkbox';
import { PlanRoutineGrid, RoutineCellMap } from './plan-routine-grid';

interface MovementRoutineConfig {
  movementId: number;
  movementName: string;
  dayOfWeek: number;
  setsPerWeek: Record<number, number>;
  cells: RoutineCellMap;
}

interface PlanCreationWizardProps {
  movements: Movement[];
  initialPlan?: PlanDetail;
  onClose?: () => void;
}

const DAY_OF_WEEK_KEYS: Record<
  number,
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'
> = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
};

function initDayMovements(
  initialPlan?: PlanDetail,
): Record<number, number | null> {
  const base: Record<number, number | null> = {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
  };
  if (!initialPlan) return base;
  for (const planMovement of initialPlan.planMovements) {
    base[planMovement.dayOfWeek] = planMovement.movementId;
  }
  return base;
}

function initMovementRoutineConfigs(
  initialPlan?: PlanDetail,
): MovementRoutineConfig[] {
  if (!initialPlan) return [];
  return [...initialPlan.planMovements]
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .map((planMovement) => {
      const setsPerWeek: Record<number, number> = {};
      for (const routine of planMovement.routines) {
        setsPerWeek[routine.week] = Math.max(setsPerWeek[routine.week] ?? 0, routine.setNumber);
      }
      return {
        movementId: planMovement.movementId,
        movementName: planMovement.movementName,
        dayOfWeek: planMovement.dayOfWeek,
        setsPerWeek,
        cells: Object.fromEntries(
          planMovement.routines.map((routine) => [
            `${routine.week}_${routine.setNumber}`,
            {
              percentagePr: String(Math.round(routine.percentagePr * 100)),
              repetitions: String(routine.repetitions),
            },
          ]),
        ),
      };
    });
}

export function PlanCreationWizard({
  movements,
  initialPlan,
  onClose,
}: PlanCreationWizardProps) {
  const t = useTranslations('Plans');
  const router = useRouter();

  const isEditMode = initialPlan !== undefined;

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [planName, setPlanName] = useState(initialPlan?.name ?? '');
  const [planDescription, setPlanDescription] = useState(
    initialPlan?.description ?? '',
  );
  const [lengthWeeks, setLengthWeeks] = useState<number>(
    initialPlan?.lengthWeeks ?? 4,
  );
  const [planSlug, setPlanSlug] = useState(initialPlan?.slug ?? '');
  const [isSystem, setIsSystem] = useState(initialPlan?.isSystem ?? false);
  const [evaluationWeek, setEvaluationWeek] = useState(
    initialPlan?.evaluationWeek ?? 1,
  );
  const slugManuallyEdited = useRef(initialPlan?.slug ? true : false);
  const [dayMovements, setDayMovements] = useState<
    Record<number, number | null>
  >(initDayMovements(initialPlan));
  const [movementRoutineConfigs, setMovementRoutineConfigs] = useState<
    MovementRoutineConfig[]
  >(initMovementRoutineConfigs(initialPlan));
  const [activeRoutineTab, setActiveRoutineTab] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function resetWizard() {
    setCurrentStep(1);
    setPlanName('');
    setPlanDescription('');
    setLengthWeeks(4);
    setPlanSlug('');
    setIsSystem(false);
    setEvaluationWeek(1);
    slugManuallyEdited.current = false;
    setDayMovements({ 1: null, 2: null, 3: null, 4: null, 5: null });
    setMovementRoutineConfigs([]);
    setActiveRoutineTab(0);
    setValidationError(null);
    setSubmitting(false);
  }

  function handleCancel() {
    if (isEditMode) {
      onClose?.();
    } else {
      resetWizard();
      setIsOpen(false);
    }
  }

  function validateStep1(): string | null {
    if (!planName.trim()) return t('validation.nameRequired');
    if (!planSlug.trim()) return t('validation.slugRequired');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(planSlug))
      return t('validation.slugInvalid');
    if (evaluationWeek < 1 || evaluationWeek > lengthWeeks)
      return t('validation.evaluationWeekInvalid');
    return null;
  }

  function validateStep2(): string | null {
    const assignedMovementIds = Object.values(dayMovements).filter(
      (id) => id !== null,
    );
    if (assignedMovementIds.length === 0) return t('validation.atLeastOneDay');
    const uniqueIds = new Set(assignedMovementIds);
    if (uniqueIds.size !== assignedMovementIds.length)
      return t('validation.duplicateMovement');
    return null;
  }

  function validateStep3(): string | null {
    for (const config of movementRoutineConfigs) {
      for (let week = 1; week <= lengthWeeks; week++) {
        const weekSets = config.setsPerWeek[week] ?? 3;
        for (let setNumber = 1; setNumber <= weekSets; setNumber++) {
          const cell = config.cells[`${week}_${setNumber}`];
          if (!cell) return t('validation.incompleteRoutines');
          const pct = parseFloat(cell.percentagePr);
          const reps = parseInt(cell.repetitions, 10);
          if (isNaN(pct) || pct < 1 || pct > 100)
            return t('validation.incompleteRoutines');
          if (isNaN(reps) || reps < 1)
            return t('validation.incompleteRoutines');
        }
      }
    }
    return null;
  }

  function handleNext() {
    setValidationError(null);

    if (currentStep === 1) {
      const error = validateStep1();
      if (error) {
        setValidationError(error);
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const error = validateStep2();
      if (error) {
        setValidationError(error);
        return;
      }

      const assignedDays = Object.entries(dayMovements)
        .filter(([, movementId]) => movementId !== null)
        .sort(([dayA], [dayB]) => Number(dayA) - Number(dayB));

      const nextConfigs = assignedDays.map(([day, movementId]) => {
        const existing = movementRoutineConfigs.find(
          (config) =>
            config.dayOfWeek === Number(day) &&
            config.movementId === movementId,
        );
        return (
          existing ?? {
            movementId: movementId!,
            movementName: movements.find((m) => m.id === movementId)!.name,
            dayOfWeek: Number(day),
            setsPerWeek: Object.fromEntries(
              Array.from({ length: lengthWeeks }, (_, i) => [i + 1, 3])
            ),
            cells: {},
          }
        );
      });
      setMovementRoutineConfigs(nextConfigs);
      setActiveRoutineTab(0);
      setCurrentStep(3);
    }
  }

  function handleBack() {
    setValidationError(null);
    if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
  }

  function updateConfigSetsPerWeek(
    configIndex: number,
    week: number,
    updater: (prev: number) => number,
  ) {
    setMovementRoutineConfigs((prev) =>
      prev.map((config, i) => {
        if (i !== configIndex) return config;
        const currentSets = config.setsPerWeek[week] ?? 3;
        const newSets = Math.min(5, Math.max(1, updater(currentSets)));
        const trimmedCells = Object.fromEntries(
          Object.entries(config.cells).filter(([key]) => {
            const [cellWeek, cellSet] = key.split('_').map(Number);
            return cellWeek !== week || cellSet <= newSets;
          }),
        );
        return {
          ...config,
          setsPerWeek: { ...config.setsPerWeek, [week]: newSets },
          cells: trimmedCells,
        };
      }),
    );
  }

  async function handleSave() {
    const error = validateStep3();
    if (error) {
      setValidationError(error);
      return;
    }

    setSubmitting(true);
    setValidationError(null);

    const assignedMovements: CreatePlanMovementInput[] =
      movementRoutineConfigs.map((config) => ({
        movementId: config.movementId,
        dayOfWeek: config.dayOfWeek,
      }));

    const routines: CreatePlanRoutineInput[] = movementRoutineConfigs.flatMap(
      (config) =>
        Object.entries(config.cells).map(([key, cell]) => {
          const [week, setNumber] = key.split('_').map(Number);
          return {
            dayOfWeek: config.dayOfWeek,
            week,
            setNumber,
            percentagePr: parseFloat(cell.percentagePr) / 100,
            repetitions: parseInt(cell.repetitions, 10),
          };
        }),
    );

    const planInput = {
      name: planName,
      description: planDescription || null,
      lengthWeeks,
      slug: planSlug,
      isSystem,
      evaluationWeek,
      movements: assignedMovements,
      routines,
    };

    const { error: saveError } = isEditMode
      ? await updatePlan(initialPlan.id, planInput)
      : await createPlan(planInput);

    if (saveError) {
      toast.error(
        isEditMode ? t('wizard.couldNotUpdate') : t('wizard.couldNotSave'),
      );
      setSubmitting(false);
      return;
    }

    router.refresh();

    if (isEditMode) {
      onClose?.();
    } else {
      resetWizard();
      setIsOpen(false);
    }
  }

  // In create mode and wizard is closed: show the trigger button
  if (!isEditMode && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full rounded-xl border border-dashed border-border bg-card px-4 py-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
      >
        + {t('createPlan')}
      </button>
    );
  }

  const stepLabels = [
    t('wizard.stepBasics'),
    t('wizard.stepMovements'),
    t('wizard.stepRoutines'),
  ];

  const saveLabel = isEditMode
    ? submitting
      ? t('wizard.updating')
      : t('wizard.update')
    : submitting
      ? t('wizard.saving')
      : t('wizard.save');

  return (
    <div className="rounded-xl border bg-card">
      {/* Step indicator */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-border/60">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isDone = stepNumber < currentStep;
          return (
            <div key={stepNumber} className="flex items-center gap-1.5 flex-1">
              <div
                className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isDone
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {stepNumber}
              </div>
              <span
                className={`text-xs font-medium truncate ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
              {index < stepLabels.length - 1 && (
                <div className="h-px flex-1 bg-border/60 mx-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="px-4 py-4">
        {currentStep === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t('wizard.nameLabel')}
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => {
                  const value = e.target.value;
                  setPlanName(value);
                  if (!slugManuallyEdited.current) {
                    const autoSlug = value
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9-]/g, '');
                    setPlanSlug(autoSlug);
                  }
                }}
                placeholder={t('wizard.namePlaceholder')}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t('wizard.descriptionLabel')}
              </label>
              <input
                type="text"
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                placeholder={t('wizard.descriptionPlaceholder')}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t('wizard.slugLabel')}
              </label>
              <input
                type="text"
                value={planSlug}
                onChange={(e) => {
                  slugManuallyEdited.current = true;
                  setPlanSlug(e.target.value);
                }}
                placeholder="e.g. strength-block-a"
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t('wizard.lengthWeeksLabel')}
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const next = Math.max(1, lengthWeeks - 1);
                    setLengthWeeks(next);
                    setEvaluationWeek((prev) => Math.min(prev, next));
                  }}
                  className="w-10 h-10 rounded-lg border border-input bg-background text-lg font-semibold hover:bg-muted transition-colors"
                >
                  −
                </button>
                <span className="min-w-[4rem] text-center text-base font-semibold tabular-nums">
                  {t('weekCount', { count: lengthWeeks })}
                </span>
                <button
                  onClick={() =>
                    setLengthWeeks((prev) => Math.min(12, prev + 1))
                  }
                  className="w-10 h-10 rounded-lg border border-input bg-background text-lg font-semibold hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t('wizard.evaluationWeekLabel')}
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setEvaluationWeek((prev) => Math.max(1, prev - 1))
                  }
                  className="w-10 h-10 rounded-lg border border-input bg-background text-lg font-semibold hover:bg-muted transition-colors"
                >
                  −
                </button>
                <span className="w-6 text-center text-base font-semibold tabular-nums">
                  {evaluationWeek}
                </span>
                <button
                  onClick={() =>
                    setEvaluationWeek((prev) => Math.min(lengthWeeks, prev + 1))
                  }
                  className="w-10 h-10 rounded-lg border border-input bg-background text-lg font-semibold hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isSystem"
                checked={isSystem}
                onCheckedChange={(checked) => setIsSystem(checked === true)}
              />
              <label htmlFor="isSystem" className="text-sm font-medium">
                {t('wizard.isSystemLabel')}
              </label>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((day) => {
              const takenIds = Object.entries(dayMovements)
                .filter(([d, id]) => Number(d) !== day && id !== null)
                .map(([, id]) => id);

              return (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-24 shrink-0">
                    {t(`wizard.${DAY_OF_WEEK_KEYS[day]}`)}
                  </span>
                  <select
                    value={dayMovements[day] ?? ''}
                    onChange={(e) =>
                      setDayMovements((prev) => ({
                        ...prev,
                        [day]:
                          e.target.value === '' ? null : Number(e.target.value),
                      }))
                    }
                    className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{t('wizard.noneOption')}</option>
                    {movements
                      .filter((m) => !takenIds.includes(m.id))
                      .map((movement) => (
                        <option key={movement.id} value={movement.id}>
                          {movement.name}
                        </option>
                      ))}
                  </select>
                </div>
              );
            })}
          </div>
        )}

        {currentStep === 3 && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-1 overflow-x-auto">
              {movementRoutineConfigs.map((config, index) => (
                <button
                  key={config.dayOfWeek}
                  onClick={() => setActiveRoutineTab(index)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeRoutineTab === index
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {config.movementName}
                </button>
              ))}
            </div>

            {movementRoutineConfigs[activeRoutineTab] && (
              <PlanRoutineGrid
                movementName={
                  movementRoutineConfigs[activeRoutineTab].movementName
                }
                lengthWeeks={lengthWeeks}
                setsPerWeek={movementRoutineConfigs[activeRoutineTab].setsPerWeek}
                cells={movementRoutineConfigs[activeRoutineTab].cells}
                onChange={(updatedCells) => {
                  setMovementRoutineConfigs((prev) =>
                    prev.map((config, index) =>
                      index === activeRoutineTab
                        ? { ...config, cells: updatedCells }
                        : config,
                    ),
                  );
                }}
                onSetsChange={(week, updater) =>
                  updateConfigSetsPerWeek(activeRoutineTab, week, updater)
                }
              />
            )}
          </div>
        )}
      </div>

      {/* Validation error */}
      {validationError && (
        <p className="text-sm text-destructive text-center px-4 pb-2">
          {validationError}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 pb-4 pt-2 border-t border-border/60">
        <button
          onClick={handleCancel}
          className="h-10 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('cancelCreate')}
        </button>

        <div className="flex-1" />

        {currentStep > 1 && (
          <button
            onClick={handleBack}
            className="h-10 px-4 rounded-lg border border-input bg-background text-sm font-medium hover:bg-muted transition-colors"
          >
            {t('wizard.back')}
          </button>
        )}

        {currentStep < 3 ? (
          <button
            onClick={handleNext}
            className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            {t('wizard.next')}
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={submitting}
            className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saveLabel}
          </button>
        )}
      </div>
    </div>
  );
}
