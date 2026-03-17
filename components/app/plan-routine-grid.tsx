'use client';

export interface RoutineCell {
  percentagePr: string;
  repetitions: string;
}

export type RoutineCellMap = Record<string, RoutineCell>;

interface PlanRoutineGridProps {
  movementName: string;
  lengthWeeks: number;
  setsPerSession: number;
  cells: RoutineCellMap;
  onChange: (updatedCells: RoutineCellMap) => void;
}

export function PlanRoutineGrid({
  movementName,
  lengthWeeks,
  setsPerSession,
  cells,
  onChange,
}: PlanRoutineGridProps) {
  const weeks = Array.from({ length: lengthWeeks }, (_, i) => i + 1);
  const sets = Array.from({ length: setsPerSession }, (_, i) => i + 1);

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
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left pb-2 pr-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-12">
                Wk
              </th>
              {sets.map((setNumber) => (
                <th
                  key={setNumber}
                  className="text-center pb-2 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Set {setNumber}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week} className="border-t border-border/40">
                <td className="py-1.5 pr-3 text-xs font-medium text-muted-foreground w-12">
                  Wk {week}
                </td>
                {sets.map((setNumber) => {
                  const key = `${week}_${setNumber}`;
                  const cell = cells[key] ?? { percentagePr: '', repetitions: '' };
                  return (
                    <td key={setNumber} className="py-1.5 px-1">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          inputMode="decimal"
                          min="1"
                          max="100"
                          value={cell.percentagePr}
                          placeholder="75"
                          onChange={(e) => handleCellChange(week, setNumber, 'percentagePr', e.target.value)}
                          className="w-10 h-8 rounded-lg bg-muted text-center text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-muted-foreground text-xs">×</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          value={cell.repetitions}
                          placeholder="5"
                          onChange={(e) => handleCellChange(week, setNumber, 'repetitions', e.target.value)}
                          className="w-8 h-8 rounded-lg bg-muted text-center text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
