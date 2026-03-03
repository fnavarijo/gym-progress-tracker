import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// Raw DB row shapes (file-private)
// ---------------------------------------------------------------------------

interface PlanRoutineRow   { percentage_pr: string; repetitions: number }
interface WorkoutSetRow    { id: number; set_number: number; scheduled_weight: string; completed_at: string | null; plan_routines: PlanRoutineRow }
interface MovementRow      { name: string }
interface PlanRow          { length_weeks: number }
interface CycleRow         { plans: PlanRow }
interface CycleMovementRow { cycle_id: number; max_pr: string; movements: MovementRow; cycles: CycleRow }
interface WorkoutRow {
  id: number;
  week: number;
  completed_at: string | null;
  cycle_movements: CycleMovementRow;
  workout_sets: WorkoutSetRow[];
}

interface WeekWorkoutRow { id: number; completed_at: string | null }

// ---------------------------------------------------------------------------
// Public model
// ---------------------------------------------------------------------------

export interface WorkoutSetDetail {
  id: number;
  setNumber: number;
  weight: number;
  percentage: number;
  reps: number;
  completedAt: string | null;
}

export interface WorkoutDetail {
  id: number;
  name: string;
  oneRM: number;
  week: number;
  totalWeeks: number;
  weeklyCompleted: number;
  weeklyTotal: number;
  sets: WorkoutSetDetail[];
}

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function toDetail(row: WorkoutRow, weekWorkouts: WeekWorkoutRow[]): WorkoutDetail {
  const sets: WorkoutSetDetail[] = [...row.workout_sets]
    .sort((a, b) => a.set_number - b.set_number)
    .map((s) => ({
      id:          s.id,
      setNumber:   s.set_number,
      weight:      parseFloat(s.scheduled_weight),
      percentage:  Math.round(parseFloat(s.plan_routines.percentage_pr) * 100),
      reps:        s.plan_routines.repetitions,
      completedAt: s.completed_at,
    }));

  return {
    id:              row.id,
    name:            row.cycle_movements.movements.name,
    oneRM:           parseFloat(row.cycle_movements.max_pr),
    week:            row.week,
    totalWeeks:      row.cycle_movements.cycles.plans.length_weeks,
    weeklyCompleted: weekWorkouts.filter((w) => w.completed_at !== null).length,
    weeklyTotal:     weekWorkouts.length,
    sets,
  };
}

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

export async function getWorkoutDetail(workoutId: number): Promise<WorkoutDetail | null> {
  const supabase = await createClient();

  const { data: workoutData, error: workoutError } = await supabase
    .from('workouts')
    .select(`
      id,
      week,
      completed_at,
      cycle_movements!inner (
        cycle_id,
        max_pr,
        movements!inner ( name ),
        cycles!inner ( plans!inner ( length_weeks ) )
      ),
      workout_sets (
        id,
        set_number,
        scheduled_weight,
        completed_at,
        plan_routines!inner ( percentage_pr, repetitions )
      )
    `)
    .eq('id', workoutId)
    .maybeSingle<WorkoutRow>();

  if (workoutError) throw workoutError;
  if (!workoutData) return null;

  const cycleId = workoutData.cycle_movements.cycle_id;

  const { data: weekData, error: weekError } = await supabase
    .from('workouts')
    .select('id, completed_at, cycle_movements!inner ( cycle_id )')
    .eq('week', workoutData.week)
    .eq('cycle_movements.cycle_id', cycleId);

  if (weekError) throw weekError;

  return toDetail(workoutData, (weekData ?? []) as WeekWorkoutRow[]);
}
