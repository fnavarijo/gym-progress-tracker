import { Button } from '@/components/ui/button';
import { OptionGroup } from '@/components/ui/option';

export default function ProgressPage() {
  return (
    <main className="w-full min-h-screen flex items-center justify-center">
      <article className="bg-card rounded-md p-4 border-border border-[1px]">
        <div className="text-center">
          <h1 className="text-4xl">Empieza un nuevo ciclo</h1>
          <p className="">Elige un ciclo para empezar el trackeo</p>
        </div>
        <div className="mt-8">
          <h2>Duracion de ciclo (semanas)</h2>
          <OptionGroup
            className="mt-4"
            name="cycleOptions"
            options={[
              { id: '4', value: '4' },
              { id: '5', value: '5' },
              { id: '6', value: '6' },
            ]}
          />
        </div>
        <div className="mt-6">
          <Button>Start Cycle</Button>
        </div>
      </article>
    </main>
  );
}
