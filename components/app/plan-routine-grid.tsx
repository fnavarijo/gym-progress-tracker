'use client';

export interface RoutineCell {
  percentagePr: string;
  repetitions: string;
}

export type RoutineCellMap = Record<string, RoutineCell>;

interface PlanRoutineGridProps {
  movementName: string;
  lengthWeeks: number;
  setsPerWeek: Record<number, number>;
  cells: RoutineCellMap;
  onChange: (updatedCells: RoutineCellMap) => void;
  onSetsChange: (week: number, updater: (prev: number) => number) => void;
}

export function PlanRoutineGrid({
  movementName,
  lengthWeeks,
  setsPerWeek,
  cells,
  onChange,
  onSetsChange,
}: PlanRoutineGridProps) {
  const weeks = Array.from({ length: lengthWeeks }, (_, i) => i + 1);

  function handleCellChange(week: number, setNumber: number, field: keyof RoutineCell, value: string) {
    const key = `${week}_${setNumber}`;
    const existing = cells[key] ?? { percentagePr: '', repetitions: '' };
    onChange({ ...cells, [key]: { ...existing, [field]: value } });
  }

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {movementName}
      </p>
      <div className="flex flex-col gap-2">
        {weeks.map((week) => {
          const weekSets = setsPerWeek[week] ?? 3;
          const sets = Array.from({ length: weekSets }, (_, i) => i + 1);
          return (
            <div key={week} className="rounded-lg border border-border/60 p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Wk {week}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSetsChange(week, (prev) => prev - 1)}
                    className="w-8 h-8 rounded-lg border border-input bg-background text-sm font-semibold hover:bg-muted transition-colors"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">
                    {weekSets}
                  </span>
                  <button
                    onClick={() => onSetsChange(week, (prev) => prev + 1)}
                    className="w-8 h-8 rounded-lg border border-input bg-background text-sm font-semibold hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {sets.map((setNumber) => {
                  const key = `${week}_${setNumber}`;
                  const cell = cells[key] ?? { percentagePr: '', repetitions: '' };
                  return (
                    <div key={setNumber} className="bg-muted rounded-lg px-2 py-1.5 flex items-center gap-1">
                      <div className="flex items-center rounded-lg bg-background focus-within:ring-2 focus-within:ring-primary overflow-hidden">
                        <input
                          type="number"
                          inputMode="decimal"
                          min="1"
                          max="100"
                          value={cell.percentagePr}
                          placeholder="75"
                          onChange={(e) => handleCellChange(week, setNumber, 'percentagePr', e.target.value)}
                          className="w-10 h-8 pl-1 bg-transparent text-center text-sm font-medium tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="pr-1 text-xs font-medium text-muted-foreground">%</span>
                      </div>
                      <span className="text-muted-foreground text-xs">×</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        value={cell.repetitions}
                        placeholder="5"
                        onChange={(e) => handleCellChange(week, setNumber, 'repetitions', e.target.value)}
                        className="w-8 h-8 rounded-lg bg-background text-center text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
