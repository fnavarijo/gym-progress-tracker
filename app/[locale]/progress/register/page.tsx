'use client';
import { CycleSlider } from '@/components/app/cycle-slider';
import { Button } from '@/components/ui/button';
import { CardContainer } from '@/components/ui/card-container';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dumbbell, Menu, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

const initialExerciseState = {
  name: '',
  pr: 0,
};

const initialSelectedExerciseState = {
  id: '',
  name: '',
  pr: 0,
};

enum PANELS {
  EXERCISES = 'EXERCISES',
  DETAILS = 'DETAILS',
}

export default function RegisterPage() {
  const t = useTranslations('Progress.register');

  const [exercise, setExercise] = useState(initialExerciseState);
  const [selectedExercise, selectExercise] = useState(
    initialSelectedExerciseState,
  );
  const [exercises, setExercises] = useState<
    { id: string; name: string; pr: number }[]
  >([]);
  const [currentPanel, setPanel] = useState(PANELS.EXERCISES);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExercises([...exercises, { ...exercise, id: Date.now().toString() }]);
    setExercise(initialExerciseState);
  };

  const removeExercise = (id: string) => {
    const filteredExercises = exercises.filter(
      (exerciseItem) => exerciseItem.id !== id,
    );
    setExercises(filteredExercises);
  };

  const getPercentages = (maxPR: number) => {
    return new Array(10).fill(0).map((_, index) => ({
      percentage: 100 - index * 10,
      maxPR: (maxPR * (100 - index * 10)) / 100,
    }));
  };

  return (
    <main className="px-4 py-4">
      <nav></nav>
      <header className="flex items-center justify-center w-full gap-2">
        <Dumbbell className="h-6 w-6 text-primary" />
        <h1 className="text-2xl">{t('title')}</h1>
      </header>
      <CardContainer className="mt-4">
        <CycleSlider />
      </CardContainer>
      <article className="mt-4">
        <div>
          <CardContainer className="flex flex-row gap-4 bg-muted p-1">
            <button
              className={`flex justify-center gap-2 w-full p-2 rounded-md  ${currentPanel === PANELS.EXERCISES && 'bg-card'}`}
              onClick={() => setPanel(PANELS.EXERCISES)}
            >
              <Menu /> {t('exercises')}
            </button>
            <button
              className={`flex justify-center gap-2 w-full p-2 rounded-md ${currentPanel === PANELS.DETAILS && 'bg-card'}`}
              onClick={() => setPanel(PANELS.DETAILS)}
            >
              <Dumbbell />
              {t('detail')}
            </button>
          </CardContainer>
        </div>
        {currentPanel === PANELS.EXERCISES && (
          <div>
            <section className="mt-8">
              <CardContainer>
                <>
                  <header>
                    <h2 className="text-lg">{t('addExercise')}</h2>
                  </header>
                  <form action="" className="space-y-4" onSubmit={onSubmit}>
                    <div>
                      <Label htmlFor="exercise-name">{t('exerciseLabel')}</Label>
                      <Input
                        type="text"
                        id="exercise-name"
                        placeholder="e.g. Bench Press, Squat"
                        value={exercise.name}
                        onChange={(e) =>
                          setExercise({ ...exercise, name: e.target.value })
                        }
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-pr">{t('maxPrLabel')}</Label>
                      <Input
                        type="number"
                        id="max-pr"
                        placeholder={t('maxPrPlaceholder')}
                        value={exercise.pr}
                        onChange={(e) =>
                          setExercise({
                            ...exercise,
                            pr: parseFloat(e.target.value),
                          })
                        }
                        required
                        className="mt-2"
                      />
                    </div>
                    <Button className="w-full" type="submit">
                      {t('addExerciseButton', { count: exercises.length })}
                    </Button>
                  </form>
                </>
              </CardContainer>
            </section>
            <section className="mt-4">
              {exercises.length === 0 ? (
                <CardContainer>
                  <p className="text-muted-foreground">
                    {t('noExercisesYet')}
                  </p>
                </CardContainer>
              ) : (
                <div className="space-y-4">
                  {exercises.map((exerciseItem, index) => (
                    <CardContainer
                      key={index}
                      className="flex flex-row items-center justify-between"
                      onClick={() => selectExercise(exerciseItem)}
                      status={
                        selectedExercise.id === exerciseItem.id ? 'selected' : undefined
                      }
                    >
                      <div className="flex flex-col text-lg">
                        {exerciseItem.name}
                        <p className="text-muted-foreground text-sm">
                          {t('max')} <span className="text-primary">{exerciseItem.pr}</span>
                        </p>
                      </div>
                      <button onClick={() => removeExercise(exerciseItem.id)}>
                        <Trash2 className="text-red-600 w-5 h-5" />
                      </button>
                    </CardContainer>
                  ))}
                </div>
              )}
            </section>
            <section className="mt-4">
              <Button>{t('completeCycle')}</Button>
            </section>
          </div>
        )}
        {currentPanel === PANELS.DETAILS && (
          <div className="mt-4">
            <section>
              <CardContainer className="flex flex-row items-center justify-between">
                <div className="flex flex-col text-lg">
                  {selectedExercise.name}
                  <p className="text-muted-foreground text-sm">
                    {t('max')}{' '}
                    <span className="text-primary">{selectedExercise.pr}</span>
                  </p>
                </div>
              </CardContainer>
            </section>
            <section className="mt-4 space-y-4">
              {getPercentages(selectedExercise.pr).map(
                ({ maxPR, percentage }, idx) => (
                  <CardContainer className="flex-row justify-between" key={idx}>
                    <div
                      className="rounded-full h-14 w-14 flex justify-center items-center text-muted "
                      style={{
                        backgroundColor: `rgba(195, 235, 120, ${percentage / 100})`,
                        color: percentage > 50 ? '#231F20' : '#F6F2FF',
                      }}
                    >
                      {percentage} %
                    </div>
                    <div className="flex flex-col items-end justify-center">
                      <span className="text-primary">{maxPR}</span> lbs
                    </div>
                  </CardContainer>
                ),
              )}
            </section>
          </div>
        )}
      </article>
    </main>
  );
}
