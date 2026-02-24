'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CycleSliderItemProps {
  cycle: number;
  length: number;
  startDate: string;
}

export function CycleSliderItem({
  cycle,
  length,
  startDate,
}: CycleSliderItemProps) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl">Ciclo {cycle}</h2>
      <div className="text-xs flex items-center gap-1 text-muted-foreground">
        <div>{length} semanas</div>
        <div> | </div>
        <div>{startDate}</div>
      </div>
    </div>
  );
}

export function CycleSlider() {
  const [selectedCycle, setSelectedCycle] = useState(0);

  const cycles = [
    { cycle: 1, length: 4, startDate: 'Feb 24, 2026' },
    { cycle: 2, length: 4, startDate: 'Feb 25, 2026' },
    { cycle: 3, length: 4, startDate: 'Feb 26, 2026' },
  ];

  const onNext = () => {
    setSelectedCycle(Math.min(selectedCycle + 1, cycles.length - 1));
  };

  const onBack = () => {
    setSelectedCycle(Math.max(selectedCycle - 1, 0));
  };

  return (
    <div className="flex justify-between">
      <button onClick={onBack}>
        <ChevronLeft className="w-5 h-5" />
      </button>
      <CycleSliderItem {...cycles[selectedCycle]} />
      <button onClick={onNext}>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
